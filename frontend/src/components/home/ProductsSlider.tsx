'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Locale, ProductList } from '@/types';
import type { Translations } from '@/i18n/az';
import ProductCard from '@/components/products/ProductCard';

interface ProductsSliderProps {
  t: Translations;
  locale: Locale;
  products: ProductList[];
}

export default function ProductsSlider({ t, locale, products }: ProductsSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild
      ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 16
      : 300;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -cardWidth * 2 : cardWidth * 2,
      behavior: 'smooth',
    });
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t.nav.products}
            </h2>
            <p className="text-gray-500 text-sm md:text-base mt-1">
              {t.home.featuredCategoriesSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop arrows */}
            <button
              onClick={() => scroll('left')}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <Link
              href="/products"
              className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors ml-2"
            >
              {t.home.viewAllProducts}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start"
            >
              <ProductCard product={product} t={t} locale={locale} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
