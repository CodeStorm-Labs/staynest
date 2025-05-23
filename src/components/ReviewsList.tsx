'use client';

import React, { useEffect, useState } from 'react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

export default function ReviewsList({ listingId }: { listingId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const response = await fetch(`/api/reviews?listingId=${listingId}`);
        if (!response.ok) {
          throw new Error('Failed to load reviews');
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        setError('Failed to load reviews');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [listingId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-gray-100 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/5 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 mx-auto text-gray-900 mb-3" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
          />
        </svg>
        <p className="text-gray-900">Henüz değerlendirme yok</p>
        <p className="text-gray-900 text-sm mt-1">İlk değerlendirmeyi siz yapın!</p>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div>
      {/* Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <div className="text-3xl font-bold text-blue-600 mr-3">
            {avgRating.toFixed(1)}
          </div>
          <div>
            <div className="text-yellow-500 text-lg">
              {'★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating))}
            </div>
            <div className="text-sm text-gray-900">
              {reviews.length} {reviews.length === 1 ? 'değerlendirme' : 'değerlendirme'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="font-medium">{r.userName || 'Misafir'}</div>
              <div className="text-gray-900 text-sm">
                {new Date(r.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <div className="text-yellow-500 mb-3">
              {'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
            </div>
            
            <p className="text-gray-900">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 