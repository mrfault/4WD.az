import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import type { Locale, ProductList } from '@/types';
import type { Translations } from '@/i18n/az';
import ProductCard from '@/components/products/ProductCard';

interface DiscountedProductsProps {
  t: Translations;
  locale: Locale;
  products: ProductList[];
}

export default function DiscountedProducts({ t, locale, products }: DiscountedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{t.home.discounted}</h2>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm md:text-base">{t.home.discountedSubtitle}</p>
          </div>
          <Link
            href={`/products?is_discounted=true`}
            className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            {t.common.viewAll}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} t={t} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
