'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import type { Translations } from '@/i18n/az';

interface ProductSortProps {
  t: Translations;
  currentOrdering?: string;
}

const sortOptions = [
  { value: '-created_at', labelKey: 'newest' as const },
  { value: 'price', labelKey: 'priceAsc' as const },
  { value: '-price', labelKey: 'priceDesc' as const },
  { value: 'title', labelKey: 'nameAz' as const },
];

export default function ProductSort({ t, currentOrdering = '-created_at' }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('ordering', value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <select
        value={currentOrdering}
        onChange={(e) => handleChange(e.target.value)}
        className="text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label={t.product.sort}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t.product.sortOptions[opt.labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
}
