import type { Metadata } from 'next';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getGalleryItems, getVehicleBrands, getCategories } from '@/lib/api';
import GalleryPageClient from './_client';

interface GalleryPageProps {
  params: Promise<{}>;
  searchParams: Promise<{ brand?: string; category?: string }>;
}

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  
  const t = getTranslation();
  return { title: t.gallery.title };
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  
  const { brand, category } = await searchParams;
  
  const t = getTranslation();

  const [galleryRes, brandsRes, categoriesRes] = await Promise.allSettled([
    getGalleryItems('az', { brand, category }),
    getVehicleBrands('az'),
    getCategories('az'),
  ]);

  const items = galleryRes.status === 'fulfilled' ? galleryRes.value : [];
  const brands = brandsRes.status === 'fulfilled' ? brandsRes.value : [];
  const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];

  return (
    <GalleryPageClient
      t={t}
      locale={'az'}
      items={items}
      brands={brands}
      categories={categories}
      initialBrand={brand}
      initialCategory={category}
    />
  );
}
