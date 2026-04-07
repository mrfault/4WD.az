import { getTranslation } from '@/lib/getTranslation';
import {
  getCategories,
  getHotSaleProducts,
  getDiscountedProducts,
  getProducts,
  getGalleryItems,
  getSettings,
} from '@/lib/api';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import HotSaleProducts from '@/components/home/HotSaleProducts';
import DiscountedProducts from '@/components/home/DiscountedProducts';
import ProductsSlider from '@/components/home/ProductsSlider';
import GalleryPreview from '@/components/home/GalleryPreview';
import ContactCTA from '@/components/home/ContactCTA';

const locale = 'az';

export default async function HomePage() {
  const t = getTranslation();

  const [categories, hotSale, discounted, allProducts, gallery, settings] =
    await Promise.allSettled([
      getCategories(locale),
      getHotSaleProducts(locale, 8),
      getDiscountedProducts(locale, 8),
      getProducts(locale, { per_page: 20, ordering: 'random' }),
      getGalleryItems(locale),
      getSettings(locale),
    ]);

  const cats = categories.status === 'fulfilled' ? categories.value : [];
  const hotSaleProducts = hotSale.status === 'fulfilled' ? hotSale.value.data : [];
  const discountedProducts = discounted.status === 'fulfilled' ? discounted.value.data : [];
  const allProductsList = allProducts.status === 'fulfilled' ? allProducts.value.data : [];
  const galleryItems = gallery.status === 'fulfilled' ? gallery.value : [];
  const sett = settings.status === 'fulfilled' ? settings.value : null;

  return (
    <>
      <HeroSection t={t} locale={locale} />
      <FeaturedCategories t={t} locale={locale} categories={cats} />
      <HotSaleProducts t={t} locale={locale} products={hotSaleProducts} />
      <ProductsSlider t={t} locale={locale} products={allProductsList} />
      <DiscountedProducts t={t} locale={locale} products={discountedProducts} />
      {galleryItems.length > 0 && (
        <GalleryPreview t={t} locale={locale} items={galleryItems} />
      )}
      <ContactCTA t={t} locale={locale} phone={sett?.contact_phone} />
    </>
  );
}
