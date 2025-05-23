import type { ReactNode } from 'react';
import '../globals.css';
import { GlobalLoadingIndicator } from '@/components/core/GlobalLoadingIndicator';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';
import 'leaflet/dist/leaflet.css';

interface Props {
  children: ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({ children, params }: Props) {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen">
        {children}
      </main>
      <ScrollToTop />
    </>
  );
} 