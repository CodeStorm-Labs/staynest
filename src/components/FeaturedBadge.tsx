'use client';

import { StarIcon } from 'lucide-react';

export default function FeaturedBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`px-2 py-1.5 bg-blue-600 text-white rounded-md shadow-md flex items-center gap-1 font-medium text-xs ${className}`}>
      <StarIcon className="h-3 w-3 fill-white text-white" />
      <span>Öne Çıkan</span>
    </div>
  );
} 