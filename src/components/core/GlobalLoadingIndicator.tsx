'use client';

import { useGlobalStore } from '@/store/useGlobalStore';
import { Loader2 } from 'lucide-react'; // shadcn/ui veya lucide-react'tan

export function GlobalLoadingIndicator() {
  const { isLoading } = useGlobalStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
} 