'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Locale, GalleryItem, VehicleBrand, Category } from '@/types';
import type { Translations } from '@/i18n/az';
import InteractiveBentoGallery from '@/components/ui/interactive-bento-gallery';
import type { BentoItem } from '@/components/ui/interactive-bento-gallery';
import { getImageUrl } from '@/lib/utils';

interface GalleryPageClientProps {
  t: Translations;
  locale: Locale;
  items: GalleryItem[];
  brands: VehicleBrand[];
  categories: Category[];
  initialBrand?: string;
  initialCategory?: string;
}

// span assignment based on position for visual variety
function getSpan(index: number): BentoItem['span'] {
  const pattern: Array<BentoItem['span']> = [
    'large', 'small', 'small', 'medium', 'small', 'small', 'small',
  ];
  return pattern[index % pattern.length];
}

export default function GalleryPageClient({
  t,
  locale,
  items,
  brands,
  categories,
  initialBrand,
  initialCategory,
}: GalleryPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const bentoItems: BentoItem[] = items.map((item, index) => {
    const title = 'az' === 'az' ? item.title_az || item.title : item.title_en || item.title;
    const description =
      'az' === 'az'
        ? item.description_az ?? item.description
        : item.description_en ?? item.description;
    const imageUrl = getImageUrl(item.image) ?? getImageUrl(item.thumbnail) ?? '';

    const allImages = (item as any).images?.length > 0
      ? (item as any).images.map((img: string) => img.startsWith('http') ? img : getImageUrl(img) ?? '')
      : [imageUrl];

    return {
      id: item.id,
      title,
      image: imageUrl,
      images: allImages.filter(Boolean),
      description,
      span: getSpan(index),
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900">{t.gallery.title}</h1>
        <p className="text-gray-500 mt-3 text-lg">{t.gallery.subtitle}</p>
      </div>

      {/* Filters */}
      {(brands.length > 0 || categories.length > 0) && (
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Brand filter */}
          {brands.length > 0 && (
            <select
              value={initialBrand ?? ''}
              onChange={(e) => applyFilter('brand', e.target.value)}
              className="filter-select max-w-xs"
            >
              <option value="">{t.gallery.allBrands}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Category filter */}
          {categories.length > 0 && (
            <select
              value={initialCategory ?? ''}
              onChange={(e) => applyFilter('category', e.target.value)}
              className="filter-select max-w-xs"
            >
              <option value="">{t.gallery.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {'az' === 'az' ? cat.name_az || cat.name : cat.name_en || cat.name}
                </option>
              ))}
            </select>
          )}

          {/* Clear filters */}
          {(initialBrand || initialCategory) && (
            <button
              onClick={() => {
                router.push(pathname);
              }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {t.product.clear}
            </button>
          )}
        </div>
      )}

      {/* Gallery */}
      {bentoItems.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <p className="text-lg font-medium">{t.gallery.noItems}</p>
        </div>
      ) : (
        <InteractiveBentoGallery items={bentoItems} />
      )}
    </div>
  );
}
