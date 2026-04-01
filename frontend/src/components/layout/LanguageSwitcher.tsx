'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/types';

interface LanguageSwitcherProps {
  locale: Locale;
}

export default function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();

  function getHref(targetLocale: Locale): string {
    // Replace the current locale segment with the target locale
    const segments = pathname.split('/');
    if (segments[1] === 'az' || segments[1] === 'en') {
      segments[1] = targetLocale;
    } else {
      segments.splice(1, 0, targetLocale);
    }
    return segments.join('/') || '/';
  }

  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm font-semibold">
      <Link
        href={getHref('az')}
        className={`px-3 py-1.5 transition-colors ${
          locale === 'az'
            ? 'bg-orange-500 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        AZ
      </Link>
      <Link
        href={getHref('en')}
        className={`px-3 py-1.5 transition-colors ${
          locale === 'en'
            ? 'bg-orange-500 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </Link>
    </div>
  );
}
