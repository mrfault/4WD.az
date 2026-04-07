import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getProductBySlug } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import ProductGallery from '@/components/products/ProductGallery';
import ProductGrid from '@/components/products/ProductGrid';
import StockBadge from '@/components/shared/StockBadge';
import DiscountBadge from '@/components/shared/DiscountBadge';
import PriceDisplay from '@/components/shared/PriceDisplay';
import ProductDetailCTA from '@/app/products/[slug]/_cta';
import JsonLd from '@/components/shared/JsonLd';

interface ProductPageProps {
  params: Promise<{ categorySlug: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { categorySlug, slug } = await params as any;
  try {
    const product = await getProductBySlug(slug, 'az');
    const title = product.meta_title_az || product.meta_title ||
      ('az' === 'az' ? product.title_az || product.title : product.title_en || product.title);
    const description = product.meta_description_az || product.meta_description || product.short_description || title;
    const img = (product.images?.[0] as any)?.url;
    const canonicalUrl = `https://4wd.az/categories/${categorySlug}/${slug}`;
    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'website',
        siteName: '4WD.az',
        images: img ? [img] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: img ? [img] : [],
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const locale = 'az';
  const { categorySlug, slug } = await params as any;

  const t = getTranslation();

  let product: any;
  let related: any[] = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/products/${slug}`,
      {
        headers: { 'Accept-Language': 'az' },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) notFound();
    const json = await res.json();
    product = json.data;
    related = json.related?.data ?? json.related ?? [];
  } catch {
    notFound();
  }

  const title =
    'az' === 'az' ? product.title_az || product.title : product.title_en || product.title;

  const description =
    'az' === 'az'
      ? product.description_az ?? product.description
      : product.description_en ?? product.description;

  const shortDescription =
    'az' === 'az'
      ? product.short_description_az ?? product.short_description
      : product.short_description_en ?? product.short_description;

  const categoryName = product.category
    ? 'az' === 'az'
      ? product.category.name_az || product.category.name
      : product.category.name_en || product.category.name
    : '';

  // Transform images for gallery component
  const galleryImages = (product.images ?? []).map((img: any) => ({
    id: img.id,
    url: img.url,
    alt_text: img.alt_text ?? title,
  }));

  // Transform compatibilities
  const compatibilities = product.compatibilities ?? [];

  const stockAvailability =
    product.stock_status === 'in_stock'
      ? 'https://schema.org/InStock'
      : product.stock_status === 'pre_order'
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/OutOfStock';

  const productImage = product.images?.[0]?.url
    ? getImageUrl(product.images[0].url) ?? undefined
    : undefined;

  const breadcrumbItems = [
    { '@type': 'ListItem' as const, position: 1, name: t.nav.home, item: 'https://4wd.az/' },
    ...(product.category
      ? [{ '@type': 'ListItem' as const, position: 2, name: categoryName, item: `https://4wd.az/categories/${categorySlug}` }]
      : []),
    { '@type': 'ListItem' as const, position: product.category ? 3 : 2, name: title },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: title,
          description: shortDescription ?? description ?? undefined,
          image: productImage,
          sku: product.sku ?? undefined,
          brand: product.brand
            ? { '@type': 'Brand', name: product.brand.name }
            : undefined,
          offers: {
            '@type': 'Offer',
            url: `https://4wd.az/categories/${categorySlug}/${slug}`,
            priceCurrency: 'AZN',
            price: product.price,
            availability: stockAvailability,
          },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems,
        }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href={`/`} className="hover:text-orange-500 transition-colors">
          {t.nav.home}
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/categories/${categorySlug}`}
              className="hover:text-orange-500 transition-colors"
            >
              {categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{title}</span>
      </nav>

      {/* Product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Gallery */}
        <div>
          <ProductGallery images={galleryImages} title={title} t={t} />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Category */}
          {product.category && (
            <div>
              <Link
                href={`/categories/${categorySlug}`}
                className="text-sm text-orange-500 font-semibold hover:underline"
              >
                {categoryName}
              </Link>
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{title}</h1>

          {/* Short description */}
          {shortDescription && (
            <p className="text-gray-600 leading-relaxed text-sm">{shortDescription}</p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <StockBadge status={product.stock_status} t={t} />
            {product.is_discounted && product.discount_percentage > 0 && (
              <DiscountBadge percent={product.discount_percentage} t={t} />
            )}
          </div>

          {/* Price */}
          <div className="py-4 border-y border-gray-100">
            <PriceDisplay price={product.price} oldPrice={product.old_price} size="lg" />
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
          )}

          {/* Compatibility */}
          {compatibilities.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                {t.product.compatibleWith}
              </h3>
              <div className="flex flex-wrap gap-2">
                {compatibilities.map((compat: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-2.5 py-1 rounded-lg"
                  >
                    {compat.brand?.name}
                    {compat.model?.name && ` - ${compat.model.name}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA button */}
          <ProductDetailCTA
            t={t}
            locale={'az'}
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
      {related && related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t.product.relatedProducts}</h2>
          <ProductGrid products={related.slice(0, 3)} t={t} locale={'az'} />
        </div>
      )}

      {/* Back link */}
      <div className="mt-12 pt-6 border-t border-gray-100">
        <Link
          href={`/categories/${categorySlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {categoryName || t.nav.products}
        </Link>
      </div>
    </div>
  );
}
