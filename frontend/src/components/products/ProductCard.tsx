'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Flame } from 'lucide-react';
import type { Locale, ProductList } from '@/types';
import type { Translations } from '@/i18n/az';
import { getImageUrl } from '@/lib/utils';
import SpotlightCard from '@/components/ui/spotlight-card';
import StockBadge from '@/components/shared/StockBadge';
import DiscountBadge from '@/components/shared/DiscountBadge';
import PriceDisplay from '@/components/shared/PriceDisplay';
import LeadFormModal from '@/components/lead/LeadFormModal';

interface ProductCardProps {
  product: ProductList;
  t: Translations;
  locale: Locale;
}

export default function ProductCard({ product, t, locale }: ProductCardProps) {
  const [leadOpen, setLeadOpen] = useState(false);

  const title =
    locale === 'az'
      ? product.title_az || product.title
      : product.title_en || product.title;
  const imageUrl = getImageUrl(product.primary_image);

  // Up to 2 compatible vehicle brands
  const compat = (product as any).compatibilities ?? (product as any).compatible_vehicles ?? [];
  const compatBrands = compat
    .slice(0, 2)
    .map((cv: any) => cv.brand?.name ?? cv)
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <SpotlightCard customSize glowColor="orange" className="flex flex-col h-full">
        {/* Image area */}
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative h-52 bg-gray-100 overflow-hidden rounded-t-2xl">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-100">
                <span className="text-orange-200 text-3xl font-black">4WD</span>
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {product.is_hot_sale && (
                <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  <Flame className="w-3 h-3" />
                  {t.product.hotSale}
                </span>
              )}
              {(product as any).discount_percentage > 0 && (
                <DiscountBadge percent={(product as any).discount_percentage} t={t} />
              )}
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          {/* Category */}
          <div className="text-xs text-gray-400 mb-1.5">
            {locale === 'az'
              ? product.category.name_az || product.category.name
              : product.category.name_en || product.category.name}
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-gray-900 text-sm leading-snug hover:text-orange-600 transition-colors line-clamp-2 mb-2">
              {title}
            </h3>
          </Link>

          {/* Compatibility */}
          {compatBrands && (
            <p className="text-xs text-gray-400 mb-3 truncate">{compatBrands}</p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stock + Price row */}
          <div className="flex items-center justify-between mb-3">
            <StockBadge status={product.stock_status} t={t} />
            <PriceDisplay price={product.price} oldPrice={product.old_price} size="sm" />
          </div>

          {/* CTA */}
          <button
            onClick={() => setLeadOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            {t.product.getIt}
          </button>
        </div>
      </SpotlightCard>

      <LeadFormModal
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        t={t}
        locale={locale}
        productId={product.id}
        productTitle={title}
        source="product"
      />
    </>
  );
}
