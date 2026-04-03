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

const locale = 'az';

export default async function HomePage() {
  const t = getTranslation();

  const [categories, hotSale, discounted, gallery, blogPosts, settings] =
    await Promise.allSettled([
      getCategories(locale),
      getHotSaleProducts(locale, 6),
      getDiscountedProducts(locale, 6),
      getGalleryItems(locale),
      getLatestBlogPosts(locale, 3),
      getSettings(locale),
    ]);

  const cats = categories.status === 'fulfilled' ? categories.value : [];
  const hotSaleProducts = hotSale.status === 'fulfilled' ? hotSale.value.data : [];
  const discountedProducts = discounted.status === 'fulfilled' ? discounted.value.data : [];
  const galleryItems = gallery.status === 'fulfilled' ? gallery.value : [];
  const posts = blogPosts.status === 'fulfilled' ? blogPosts.value : [];
  const sett = settings.status === 'fulfilled' ? settings.value : null;

  return (
    <>
      <HeroSection t={t} locale={locale} />
      <FeaturedCategories t={t} locale={locale} categories={cats} />
      <HotSaleProducts t={t} locale={locale} products={hotSaleProducts} />
      <WhyChooseUs t={t} />
      <DiscountedProducts t={t} locale={locale} products={discountedProducts} />
      {galleryItems.length > 0 && (
        <GalleryPreview t={t} locale={locale} items={galleryItems} />
      )}
      {posts.length > 0 && (
        <LatestBlogPosts t={t} locale={locale} posts={posts} />
      )}
      <ContactCTA t={t} locale={locale} phone={sett?.contact_phone} />
    </>
  );
}
