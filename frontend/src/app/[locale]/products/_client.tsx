'use client';

import { useState } from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import type { Locale, PaginatedResponse, ProductList, Category, VehicleBrand, FilterParams } from '@/types';
import type { Translations } from '@/i18n/az';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort from '@/components/products/ProductSort';
import { useSearchParams } from 'next/navigation';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
  t: Translations;
  locale: Locale;
  initialProducts: PaginatedResponse<ProductList>;
  categories: Category[];
  brands: VehicleBrand[];
  initialFilters: FilterParams;
  fixedCategory?: string;
  categoryName?: string;
}

export default function ProductsPageClient({
  t,
  locale,
  initialProducts,
  categories,
  brands,
  initialFilters,
  fixedCategory,
  categoryName,
}: Props) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentOrdering = searchParams.get('ordering') ?? '-created_at';
  const currentPage = parseInt(searchParams.get('page') ?? '1');

  const totalPages = Math.ceil(initialProducts.meta.total / ITEMS_PER_PAGE);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const search = fd.get('search') as string;
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header - only shown when not inside a category page (which has its own hero) */}
      {!fixedCategory && (
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">{t.nav.products}</h1>
          <p className="text-gray-500 mt-1">
            {initialProducts.meta.total} {t.common.items}
          </p>
        </div>
      )}
      {fixedCategory && (
        <div className="mb-8">
          <p className="text-gray-500 mt-1">
            {initialProducts.meta.total} {t.common.items}
          </p>
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-6 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          name="search"
          type="text"
          defaultValue={initialFilters.search ?? ''}
          placeholder={t.product.search}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
        />
      </form>

      <div className="flex gap-8">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <ProductFilters
              t={t}
              locale={locale}
              categories={categories}
              brands={brands}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t.product.filters}
            </button>
            <div className="ml-auto">
              <ProductSort t={t} currentOrdering={currentOrdering} />
            </div>
          </div>

          {/* Products */}
          <ProductGrid products={initialProducts?.data ?? []} t={t} locale={locale} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t.common.previous}
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                      page === currentPage
                        ? 'bg-orange-500 text-white'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t.common.next}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters */}
      {mobileFiltersOpen && (
        <ProductFilters
          t={t}
          locale={locale}
          categories={categories}
          brands={brands}
          isMobile
          onClose={() => setMobileFiltersOpen(false)}
        />
      )}
    </div>
  );
}
