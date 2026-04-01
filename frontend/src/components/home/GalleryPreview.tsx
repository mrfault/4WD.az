import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Locale, GalleryItem } from '@/types';
import type { Translations } from '@/i18n/az';
import { getImageUrl } from '@/lib/utils';
import InteractiveBentoGallery from '@/components/ui/interactive-bento-gallery';
import type { BentoItem } from '@/components/ui/interactive-bento-gallery';
import SectionHeader from '@/components/shared/SectionHeader';

interface GalleryPreviewProps {
  t: Translations;
  locale: Locale;
  items: GalleryItem[];
}

// Map gallery spans based on position
const spanMap: Array<BentoItem['span']> = [
  'large', 'small', 'small', 'medium', 'small', 'small', 'small',
];

export default function GalleryPreview({ t, locale, items }: GalleryPreviewProps) {
  if (items.length === 0) return null;

  const bentoItems: BentoItem[] = items.slice(0, 7).map((item, index) => {
    const imageUrl = getImageUrl(item.image) ?? '';
    return {
      id: item.id,
      title: locale === 'az' ? item.title_az || item.title : item.title_en || item.title,
      image: imageUrl,
      description:
        locale === 'az'
          ? item.description_az ?? item.description
          : item.description_en ?? item.description,
      span: spanMap[index],
    };
  });

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.home.galleryPreview}
          subtitle={t.home.galleryPreviewSubtitle}
          action={
            <Link
              href={`/${locale}/gallery`}
              className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              {t.home.viewGallery}
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
        <InteractiveBentoGallery items={bentoItems} />
      </div>
    </section>
  );
}
