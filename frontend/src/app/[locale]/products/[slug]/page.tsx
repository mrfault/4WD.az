import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getProductBySlug, getRelatedProducts } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import ProductGallery from '@/components/products/ProductGallery';
import ProductGrid from '@/components/products/ProductGrid';
import StockBadge from '@/components/shared/StockBadge';
import DiscountBadge from '@/components/shared/DiscountBadge';
import PriceDisplay from '@/components/shared/PriceDisplay';
import ProductDetailCTA from './_cta';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const product = await getProductBySlug(slug, locale as Locale);
    const title =
      locale === 'az' ? product.title_az || product.title : product.title_en || product.title;
    const primaryImage = getImageUrl(product.primary_image);
    return {
      title,
      description:
        (locale === 'az' ? product.short_description_az : product.short_description_en) ??
        product.short_description ??
        title,
      openGraph: {
        title,
        images: primaryImage ? [primaryImage] : [],
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const safeLocale = locale as Locale;
  const t = getTranslation(safeLocale);

  let product;
  try {
    product = await getProductBySlug(slug, safeLocale);
  } catch {
    notFound();
  }

  const related = await getRelatedProducts(slug, safeLocale).catch(() => []);

  const title =
    safeLocale === 'az' ? product.title_az || product.title : product.title_en || product.title;

  const description =
    safeLocale === 'az'
      ? product.description_az ?? product.description
      : product.description_en ?? product.description;

  const shortDescription =
    safeLocale === 'az'
      ? product.short_description_az ?? product.short_description
      : product.short_description_en ?? product.short_description;

  const categoryName =
    safeLocale === 'az'
      ? product.category.name_az || product.category.name
      : product.category.name_en || product.category.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link
          href={`/${safeLocale}`}
          className="hover:text-orange-500 transition-colors"
        >
          {t.nav.home}
        </Link>
        <span>/</span>
        <Link
          href={`/${safeLocale}/products`}
          className="hover:text-orange-500 transition-colors"
        >
          {t.nav.products}
        </Link>
        <span>/</span>
        <Link
          href={`/${safeLocale}/categories/${product.category.slug}`}
          className="hover:text-orange-500 transition-colors"
        >
          {categoryName}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{title}</span>
      </nav>

      {/* Product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Gallery */}
        <div>
          <ProductGallery images={product.images} title={title} t={t} />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Category */}
          <div>
            <Link
              href={`/${safeLocale}/categories/${product.category.slug}`}
              className="text-sm text-orange-500 font-semibold hover:underline"
            >
              {categoryName}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{title}</h1>

          {/* Short description */}
          {shortDescription && (
            <p className="text-gray-600 leading-relaxed text-sm">{shortDescription}</p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <StockBadge status={product.stock_status} t={t} />
            {product.discount_percent && product.discount_percent > 0 && (
              <DiscountBadge percent={product.discount_percent} t={t} />
            )}
            {product.is_hot_sale && (
              <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                {t.product.hotSale}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="py-4 border-y border-gray-100">
            <PriceDisplay price={product.price} oldPrice={product.old_price} size="lg" />
          </div>

          {/* SKU */}
          {product.specifications.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                {t.product.specifications}
              </h3>
              <dl className="divide-y divide-gray-200">
                {product.specifications.map((spec) => {
                  const specName =
                    safeLocale === 'az'
                      ? spec.name_az || spec.name
                      : spec.name_en || spec.name;
                  const specValue =
                    safeLocale === 'az'
                      ? spec.value_az || spec.value
                      : spec.value_en || spec.value;
                  return (
                    <div key={spec.id} className="py-2.5 flex justify-between text-sm">
                      <dt className="text-gray-500 font-medium">{specName}</dt>
                      <dd className="text-gray-900 font-semibold text-right">{specValue}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          {/* Compatibility */}
          {product.compatible_vehicles && product.compatible_vehicles.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                {t.product.compatibleWith}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.compatible_vehicles.map((compat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-2.5 py-1 rounded-lg"
                  >
                    {compat.brand.name}
                    {compat.models.length > 0 && (
                      <>
                        {' - '}
                        {compat.models.map((m) => m.name).join(', ')}
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA button - client component for modal */}
          <ProductDetailCTA
            t={t}
            locale={safeLocale}
            productId={product.id}
            productTitle={title}
          />
        </div>
      </div>

      {/* Full description */}
      {description && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
            {t.product.description}
          </h2>
          <div
            className="prose max-w-none text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t.product.relatedProducts}</h2>
          <ProductGrid products={related.slice(0, 3)} t={t} locale={safeLocale} />
        </div>
      )}

      {/* Back link */}
      <div className="mt-12 pt-6 border-t border-gray-100">
        <Link
          href={`/${safeLocale}/products`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.nav.products}
        </Link>
      </div>
    </div>
  );
}
