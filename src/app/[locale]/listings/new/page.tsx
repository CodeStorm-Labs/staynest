'use client';

import NewListingForm from '@/components/NewListingForm';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function NewListingPage() {
  const params = useParams();
  const locale = params.locale as string;
  
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="container mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/${locale}/listings`} className="text-blue-600 hover:underline mb-2 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              İlanlara Geri Dön
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Yeni İlan Oluştur</h1>
            <p className="text-gray-600 mt-1">İlanınızı oluşturun ve misafirlerinizi bekleyin.</p>
          </div>
          
          <Link 
            href={`/${locale}/dashboard`}
            className="bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-2 inline-flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Kontrol Paneline Git
          </Link>
        </div>
      </div>
      
      <NewListingForm />
    </div>
  );
} 