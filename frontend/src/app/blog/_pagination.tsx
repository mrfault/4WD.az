'use client';

import Link from 'next/link';
import type { Locale } from '@/types';
import type { Translations } from '@/i18n/az';

interface BlogPaginationProps {
  locale: Locale;
  currentPage: number;
  totalPages: number;
  t: Translations;
}

export default function BlogPagination({
  locale,
  currentPage,
  totalPages,
  t,
}: BlogPaginationProps) {
  function getPageHref(page: number) {
    return `/blog${page > 1 ? `?page=${page}` : ''}`;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {currentPage > 1 && (
        <Link
          href={getPageHref(currentPage - 1)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t.common.previous}
        </Link>
      )}

      {(() => {
        const maxVisible = 7;
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
          start = Math.max(1, end - maxVisible + 1);
        }
        const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        return pages.map((page) => (
          <Link
            key={page}
            href={getPageHref(page)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center ${
              page === currentPage
                ? 'bg-orange-500 text-white'
                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </Link>
        ));
      })()}

      {currentPage < totalPages && (
        <Link
          href={getPageHref(currentPage + 1)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t.common.next}
        </Link>
      )}
    </div>
  );
}
