import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import type { Locale, ProductList } from '@/types';
import type { Translations } from '@/i18n/az';
import ProductCard from '@/components/products/ProductCard';

interface HotSaleProductsProps {
  t: Translations;
  locale: Locale;
  products: ProductList[];
}

export default function HotSaleProducts({ t, locale, products }: HotSaleProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.home.hotSale}</h2>
            </div>
            <p className="text-gray-500 text-sm md:text-base">{t.home.hotSaleSubtitle}</p>
          </div>
          <Link
            href={`/products?is_hot_sale=true`}
            className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            {t.common.viewAll}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} t={t} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
