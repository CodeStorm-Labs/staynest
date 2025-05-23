import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim - StayNest',
  description: 'StayNest ile iletişime geçin. Sorularınız ve görüşleriniz için bize ulaşın.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 