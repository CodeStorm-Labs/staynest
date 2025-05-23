'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { addDays, differenceInDays, format, isBefore, addYears, getYear } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Stack } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

type Props = {
  listingId: string;
  price: number;
  title: string;
};

type BookingStep = 'dates' | 'details' | 'confirmation';

export default function BookingForm({ listingId, price, title }: Props) {
  const router = useRouter();
  const { locale } = useParams();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [maxGuests] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>('dates');
  const [totalPrice, setTotalPrice] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [, setAvailableDates] = useState<{[key: string]: boolean}>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Initialize with today + min/max dates
  const today = new Date();
  const maxDate = addYears(today, 2);

  // Fetch available dates for the listing
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsCheckingAvailability(true);
      try {
        // This would be an actual API call to check availability
        // For now we'll simulate it with all dates available
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        const dateMap: {[key: string]: boolean} = {};
        let currentDate = new Date();
        
        while (currentDate < nextYear) {
          dateMap[format(currentDate, 'yyyy-MM-dd')] = true;
          currentDate = addDays(currentDate, 1);
        }
        
        setAvailableDates(dateMap);
      } catch (error: unknown) {
        console.error('Failed to fetch availability:', error instanceof Error ? error.message : error);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    fetchAvailability();
  }, [listingId]);

  // Calculate pricing whenever dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      const days = differenceInDays(checkOut, checkIn);
      if (days > 0) {
        const subtotal = days * price;
        const fee = Math.round(subtotal * 0.12); // 12% service fee
        setServiceFee(fee);
        setTotalPrice(subtotal + fee);
      }
    }
  }, [checkIn, checkOut, price]);

  const validateDates = () => {
    if (!checkIn || !checkOut) {
      setError('Lütfen giriş ve çıkış tarihlerini seçin');
      return false;
    }

    if (isBefore(checkOut, checkIn)) {
      setError('Çıkış tarihi giriş tarihinden sonra olmalıdır');
      return false;
    }

    if (differenceInDays(checkOut, checkIn) < 1) {
      setError('En az 1 gece konaklama yapmalısınız');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDateChange = () => {
    if (validateDates()) {
      setCurrentStep('details');
    }
  };

  const handleDetailsNext = () => {
    if (guests < 1) {
      setError('En az 1 misafir seçmelisiniz');
      return;
    }
    setError(null);
    setCurrentStep('confirmation');
  };

  const handleBookingSubmit = async () => {
    if (!checkIn || !checkOut) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          listingId, 
          checkIn: format(checkIn, 'yyyy-MM-dd'), 
          checkOut: format(checkOut, 'yyyy-MM-dd'), 
          guests 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Rezervasyon oluşturulamadı');
        setIsLoading(false);
        return;
      }
      
      router.push(`/${locale}/dashboard?booking=success`);
    } catch (error: unknown) {
      console.error('Booking failed:', error instanceof Error ? error.message : error);
      setError('Beklenmeyen bir hata oluştu');
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'dd MMMM yyyy', { locale: tr });
  };

  // Generate days for the guest dropdown
  const guestOptions = Array.from({ length: maxGuests }, (_, i) => i + 1);

  // Get current year for range calculation
  const currentYear = getYear(new Date());

  return (
    <div className="rounded-2xl shadow-lg p-6">
      <div className="mb-6 border-b pb-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xl font-bold">{price}₺ <span className="text-muted-foreground text-base font-normal">/ gece</span></h3>
          {checkIn && checkOut && (
            <div className="text-sm text-muted-foreground">
              {differenceInDays(checkOut, checkIn)} gece
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {currentStep === 'dates' && (
        <>
          {/* Date selection instructions */}
          <div className="mb-4">
            {!checkIn && !checkOut && (
              <p className="text-sm text-muted-foreground">Önce giriş tarihini seçin</p>
            )}
            {checkIn && !checkOut && (
              <p className="text-sm text-muted-foreground">Şimdi çıkış tarihini seçin</p>
            )}
            {checkIn && checkOut && (
              <p className="text-sm text-foreground">
                Seçilen: {formatDate(checkIn)} - {formatDate(checkOut)}
              </p>
            )}
          </div>
          <div className="bg-card p-4 rounded-lg shadow-inner mb-4">
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <Stack spacing={3}>
                <DatePicker
                  label="Giriş Tarihi"
                  value={checkIn}
                  onChange={(newValue: Date | null) => setCheckIn(newValue)}
                  minDate={today}
                  maxDate={maxDate}
                  views={['day', 'month', 'year']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      error: Boolean(error && !checkIn),
                      InputProps: {
                        sx: {
                          color: 'white',
                          borderColor: 'white'
                        }
                      },
                      InputLabelProps: {
                        sx: {
                          color: 'white'
                        }
                      },
                      sx: {
                        '& .MuiInputBase-root': { 
                          color: 'white',
                          borderColor: 'white',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
                        },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                        '& .MuiSvgIcon-root': { color: 'white' }
                      }
                    }
                  }}
                />
                
                <DatePicker
                  label="Çıkış Tarihi"
                  value={checkOut}
                  onChange={(newValue: Date | null) => setCheckOut(newValue)}
                  minDate={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
                  maxDate={maxDate}
                  views={['day', 'month', 'year']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      error: Boolean(error && !checkOut),
                      InputProps: {
                        sx: {
                          color: 'white',
                          borderColor: 'white'
                        }
                      },
                      InputLabelProps: {
                        sx: {
                          color: 'white'
                        }
                      },
                      sx: {
                        '& .MuiInputBase-root': { 
                          color: 'white',
                          borderColor: 'white',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
                        },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                        '& .MuiSvgIcon-root': { color: 'white' }
                      }
                    }
                  }}
                />
              </Stack>
            </LocalizationProvider>
          </div>
          <button
            type="button"
            onClick={handleDateChange}
            disabled={isCheckingAvailability}
            className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {isCheckingAvailability ? 'Müsaitlik kontrol ediliyor...' : 'Devam Et'}
          </button>
        </>
      )}
      
      {currentStep === 'details' && (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Tarih Aralığı</span>
              <button 
                type="button" 
                onClick={() => setCurrentStep('dates')}
                className="text-primary underline"
              >
                Düzenle
              </button>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">
                {formatDate(checkIn)} - {formatDate(checkOut)}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Misafir Sayısı</label>
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {guestOptions.map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'misafir' : 'misafir'}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            onClick={handleDetailsNext}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Devam Et
          </button>
        </>
      )}
      
      {currentStep === 'confirmation' && (
        <>
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Rezervasyon Özeti</h4>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Konaklama</span>
                <span>{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarihler</span>
                <span>{formatDate(checkIn)} - {formatDate(checkOut)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Misafir</span>
                <span>{guests} kişi</span>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{price}₺ x {differenceInDays(checkOut!, checkIn!)} gece</span>
                <span>{price * differenceInDays(checkOut!, checkIn!)}₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servis ücreti</span>
                <span>{serviceFee}₺</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Toplam</span>
                <span>{totalPrice}₺</span>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleBookingSubmit}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {isLoading ? 'Rezervasyon Yapılıyor...' : 'Rezervasyon Yap'}
          </button>
          
          <button
            type="button"
            onClick={() => setCurrentStep('details')}
            className="w-full mt-2 bg-secondary text-secondary-foreground py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
          >
            Geri
          </button>
        </>
      )}
      
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Rezervasyon yaparak site koşullarını ve kurallarını kabul etmiş olursunuz.
      </p>
    </div>
  );
} 