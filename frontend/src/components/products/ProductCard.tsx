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
        <Link href={`/categories/${product.category.slug}/${product.slug}`} className="block">
          <div className="relative aspect-square sm:aspect-[4/3] bg-white overflow-hidden rounded-t-xl sm:rounded-t-2xl">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <span className="text-orange-200 text-xl sm:text-3xl font-black">4WD</span>
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-col gap-1">
              {product.is_hot_sale && (
                <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">{t.product.hotSale}</span>
                </span>
              )}
              {(product as any).discount_percentage > 0 && (
                <DiscountBadge percent={(product as any).discount_percentage} t={t} />
              )}
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="flex flex-col flex-1 p-2 sm:p-4">
          {/* Category - hidden on mobile */}
          <div className="hidden sm:block text-xs text-gray-400 mb-1.5">
            {locale === 'az'
              ? product.category.name_az || product.category.name
              : product.category.name_en || product.category.name}
          </div>

          {/* Title */}
          <Link href={`/categories/${product.category.slug}/${product.slug}`}>
            <h3 className="font-semibold sm:font-bold text-gray-900 text-[11px] sm:text-sm leading-tight sm:leading-snug hover:text-orange-600 transition-colors line-clamp-2 mb-1 sm:mb-2">
              {title}
            </h3>
          </Link>

          {/* Compatibility - hidden on mobile */}
          {compatBrands && (
            <p className="hidden sm:block text-xs text-gray-400 mb-3 truncate">{compatBrands}</p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stock + Price */}
          <div className="flex items-center justify-between mb-1.5 sm:mb-3">
            <PriceDisplay price={product.price} oldPrice={product.old_price} size="sm" />
            <StockBadge status={product.stock_status} t={t} />
          </div>

          {/* CTA */}
          <button
            onClick={() => setLeadOpen(true)}
            className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors text-[11px] sm:text-sm"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
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
