import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Tag } from 'lucide-react';
import type { Locale, Category } from '@/types';
import type { Translations } from '@/i18n/az';
import { getImageUrl } from '@/lib/utils';
import SectionHeader from '@/components/shared/SectionHeader';

interface FeaturedCategoriesProps {
  t: Translations;
  locale: Locale;
  categories: Category[];
}

export default function FeaturedCategories({
  t,
  locale,
  categories,
}: FeaturedCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.home.featuredCategories}
          subtitle={t.home.featuredCategoriesSubtitle}
          action={
            <Link
              href={`/${locale}/products`}
              className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              {t.common.viewAll}
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => {
            const imageUrl = getImageUrl(cat.image);
            const name = locale === 'az' ? cat.name_az || cat.name : cat.name_en || cat.name;
            return (
              <Link
                key={cat.id}
                href={`/${locale}/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200 text-center"
              >
                {/* Icon/image */}
                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Tag className="w-6 h-6 text-orange-500" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors leading-tight">
                  {name}
                </span>
                {cat.product_count !== undefined && (
                  <span className="text-xs text-gray-400">{cat.product_count}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
