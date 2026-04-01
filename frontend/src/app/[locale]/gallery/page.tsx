import type { Metadata } from 'next';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getGalleryItems, getVehicleBrands, getCategories } from '@/lib/api';
import GalleryPageClient from './_client';

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ brand?: string; category?: string }>;
}

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslation(locale as Locale);
  return { title: t.gallery.title };
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const { locale } = await params;
  const { brand, category } = await searchParams;
  const safeLocale = locale as Locale;
  const t = getTranslation(safeLocale);

  const [galleryRes, brandsRes, categoriesRes] = await Promise.allSettled([
    getGalleryItems(safeLocale, { brand, category }),
    getVehicleBrands(safeLocale),
    getCategories(safeLocale),
  ]);

  const items = galleryRes.status === 'fulfilled' ? galleryRes.value : [];
  const brands = brandsRes.status === 'fulfilled' ? brandsRes.value : [];
  const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];

  return (
    <GalleryPageClient
      t={t}
      locale={safeLocale}
      items={items}
      brands={brands}
      categories={categories}
      initialBrand={brand}
      initialCategory={category}
    />
  );
}
