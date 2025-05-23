'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { formatCurrency } from '@/lib/stripe-client';
import { differenceInDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  totalPrice: number;
  subtotal: number;
  error?: string;
}

function PaymentFormInner({
  listingId,
  listingTitle,
  listingPrice,
  checkIn,
  checkOut,
  guests,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { locale } = useParams();
  
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const nights = differenceInDays(checkOut, checkIn);

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listingId,
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            guests,
            nights,
          }),
        });

        const data: PaymentIntentResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setTotalPrice(data.totalPrice);
        setSubtotal(data.subtotal);
        setServiceFee(data.totalPrice - data.subtotal);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    createPaymentIntent();
  }, [listingId, checkIn, checkOut, guests, nights]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsLoading(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can add billing details here if needed
          },
        },
      }
    );

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setSuccess(true);
      setIsLoading(false);
      
      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push(`/${locale}/dashboard?booking=success&payment=${paymentIntent.id}`);
      }, 2000);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#000',
        '::placeholder': {
          color: '#666',
        },
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626',
      },
    },
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h2>
          <p className="text-gray-600">Rezervasyonunuz onaylandı. Kısa süre içinde yönlendirileceksiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ödeme Bilgileri</h2>
      
      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">{listingTitle}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Giriş:</span>
            <span>{format(checkIn, 'dd MMMM yyyy', { locale: tr })}</span>
          </div>
          <div className="flex justify-between">
            <span>Çıkış:</span>
            <span>{format(checkOut, 'dd MMMM yyyy', { locale: tr })}</span>
          </div>
          <div className="flex justify-between">
            <span>Misafir sayısı:</span>
            <span>{guests} misafir</span>
          </div>
          <div className="flex justify-between">
            <span>Gece sayısı:</span>
            <span>{nights} gece</span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      {subtotal > 0 && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h4 className="font-medium mb-4">Fiyat Detayı</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{formatCurrency(listingPrice)} x {nights} gece</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Hizmet bedeli</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
              <span>Toplam</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kart Bilgileri
          </label>
          <div className="border border-gray-300 rounded-lg p-4">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || !clientSecret || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isLoading || !stripe || !clientSecret
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? 'İşleniyor...' : `${formatCurrency(totalPrice)} Öde`}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Ödemeniz Stripe tarafından güvenli şekilde işlenir.</p>
      </div>
    </div>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  );
} 