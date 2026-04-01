import Link from 'next/link';
import {
  ArrowRight,
  Tag,
  Cog,
  Wrench,
  Disc3,
  Car,
  Zap,
  ShieldCheck,
  Cable,
  Fuel,
  Settings2,
  Hammer,
} from 'lucide-react';
import type { Locale, Category } from '@/types';
import type { Translations } from '@/i18n/az';
import SectionHeader from '@/components/shared/SectionHeader';

const categoryIcons: Record<string, React.ElementType> = {
  suspension: Cog,
  'lift-kits': Wrench,
  'wheels-tires': Disc3,
  'roof-racks': Car,
  lighting: Zap,
  bumpers: ShieldCheck,
  winches: Cable,
  snorkels: Fuel,
  interior: Settings2,
  'recovery-gear': Hammer,
};

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
  if (!categories || categories.length === 0) return null;

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
            const name = locale === 'az' ? cat.name_az || cat.name : cat.name_en || cat.name;
            const IconComponent = categoryIcons[cat.slug] || Tag;
            return (
              <Link
                key={cat.id}
                href={`/${locale}/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                  <IconComponent className="w-7 h-7 text-orange-500" />
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
