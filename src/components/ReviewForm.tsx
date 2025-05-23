'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Props = {
  listingId?: string;
  bookingId?: string;
};

export default function ReviewForm({ listingId, bookingId }: Props) {
  const router = useRouter();
  const { locale } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [actualListingId, setActualListingId] = useState<string | undefined>(listingId);

  // If we have a bookingId but no listingId, fetch the listingId
  useEffect(() => {
    if (bookingId && !listingId) {
      const fetchBookingDetails = async () => {
        try {
          const res = await fetch(`/api/bookings/${bookingId}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!res.ok) {
            console.error('Failed to fetch booking details');
            return;
          }
          
          const data = await res.json();
          setActualListingId(data.listingId);
        } catch (err) {
          console.error('Error fetching booking details:', err);
        }
      };
      
      fetchBookingDetails();
    }
  }, [bookingId, listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualListingId) {
      setError('Listing ID is missing');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          listingId: actualListingId, 
          bookingId, 
          rating, 
          comment 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Değerlendirme gönderilemedi');
        setIsSubmitting(false);
        return;
      }
      
      setSuccess('Değerlendirmeniz için teşekkürler!');
      setComment('');
      router.refresh();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 border border-gray-200 rounded-xl shadow-sm bg-white">
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
          <p>{success}</p>
        </div>
      )}
      
      <div>
        <label className="block font-medium mb-1 text-gray-900">Puanlama</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${
                rating >= value 
                  ? 'bg-yellow-400 text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}
              aria-label={`${value} yıldız`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 self-center text-gray-900">
            {rating} yıldız
          </span>
        </div>
      </div>
      
      <div>
        <label htmlFor="comment" className="block font-medium mb-1 text-gray-900">Yorumunuz</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          rows={4}
          placeholder="Bu konaklama hakkında düşüncelerinizi paylaşın..."
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || !actualListingId}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {isSubmitting ? 'Gönderiliyor...' : 'Değerlendirme Gönder'}
      </button>
    </form>
  );
} 