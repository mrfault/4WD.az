import type { Metadata } from 'next';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import {
  getCategories,
  getHotSaleProducts,
  getDiscountedProducts,
  getGalleryItems,
  getLatestBlogPosts,
  getSettings,
} from '@/lib/api';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import HotSaleProducts from '@/components/home/HotSaleProducts';
import DiscountedProducts from '@/components/home/DiscountedProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import GalleryPreview from '@/components/home/GalleryPreview';
import LatestBlogPosts from '@/components/home/LatestBlogPosts';
import ContactCTA from '@/components/home/ContactCTA';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === 'az'
        ? '4WD.az - Offroad Aksessuarları | Ana Səhifə'
        : '4WD.az - Offroad Accessories | Home',
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const safeLocale = locale as Locale;
  const t = getTranslation(safeLocale);

  const [categories, hotSale, discounted, gallery, blogPosts, settings] =
    await Promise.allSettled([
      getCategories(safeLocale),
      getHotSaleProducts(safeLocale, 6),
      getDiscountedProducts(safeLocale, 6),
      getGalleryItems(safeLocale),
      getLatestBlogPosts(safeLocale, 3),
      getSettings(safeLocale),
    ]);

  const cats = categories.status === 'fulfilled' ? categories.value : [];
  const hotSaleProducts =
    hotSale.status === 'fulfilled' ? hotSale.value.data : [];
  const discountedProducts =
    discounted.status === 'fulfilled' ? discounted.value.data : [];
  const galleryItems = gallery.status === 'fulfilled' ? gallery.value : [];
  const posts = blogPosts.status === 'fulfilled' ? blogPosts.value : [];
  const sett = settings.status === 'fulfilled' ? settings.value : null;

  return (
    <>
      <HeroSection t={t} locale={safeLocale} />
      <FeaturedCategories t={t} locale={safeLocale} categories={cats} />
      <HotSaleProducts t={t} locale={safeLocale} products={hotSaleProducts} />
      <WhyChooseUs t={t} />
      <DiscountedProducts t={t} locale={safeLocale} products={discountedProducts} />
      {galleryItems.length > 0 && (
        <GalleryPreview t={t} locale={safeLocale} items={galleryItems} />
      )}
      {posts.length > 0 && (
        <LatestBlogPosts t={t} locale={safeLocale} posts={posts} />
      )}
      <ContactCTA t={t} locale={safeLocale} phone={sett?.contact_phone} />
    </>
  );
}
