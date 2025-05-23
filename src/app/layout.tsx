import './globals.css';
import { Inter } from 'next/font/google';
import { GlobalLoadingIndicator } from '@/components/core/GlobalLoadingIndicator';
import ThemeWrapper from '@/components/core/ThemeWrapper';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'StayNest',
  description: 'Full-stack Airbnb-like platform for booking stays in Turkey and beyond',
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  // Default to Turkish as the main language
  return (
    <html lang="tr" className={`${inter.className} dark`}>
      <body>
        <ThemeWrapper>
          <Providers>
            <GlobalLoadingIndicator />
            {children}
          </Providers>
        </ThemeWrapper>
      </body>
    </html>
  );
}
