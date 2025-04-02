import './globals.css';
import { Inter } from 'next/font/google';
import { GlobalLoadingIndicator } from '@/components/core/GlobalLoadingIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Blognate',
  description: 'Modern and powerful blog platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark" lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <GlobalLoadingIndicator />
        {children}
      </body>
    </html>
  );
}
