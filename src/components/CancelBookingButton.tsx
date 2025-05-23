'use client';

import { useState } from 'react';

interface CancelBookingButtonProps {
  bookingId: string;
  onSuccess?: () => void;
}

export default function CancelBookingButton({ bookingId, onSuccess }: CancelBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'İptal işlemi sırasında bir hata oluştu');
      }
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          <h3 className="text-lg font-bold mb-4">Rezervasyonu İptal Et</h3>
          <p className="mb-6 text-gray-900">Bu rezervasyonu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Vazgeç
            </button>
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'İptal Ediliyor...' : 'Evet, İptal Et'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm text-red-600 hover:text-red-800 font-medium"
      disabled={isLoading}
    >
      İptal Et
    </button>
  );
} 