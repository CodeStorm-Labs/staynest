'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segments = pathname.split('/');
  const currentLocale = segments[1] || '';
  const otherLocale = currentLocale === 'tr' ? 'en' : 'tr';
  segments[1] = otherLocale;
  const newPath = segments.join('/') || '/';
  const queryString = searchParams.toString();
  const href = queryString ? `${newPath}?${queryString}` : newPath;

  return (
    <Link
      href={href}
      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
    >
      {otherLocale.toUpperCase()}
    </Link>
  );
} 