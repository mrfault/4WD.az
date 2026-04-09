import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/getTranslation';
import {
  getCatalogGeneration,
  getCatalogGenerationProducts,
  getCatalogModels,
} from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import JsonLd from '@/components/shared/JsonLd';
import ProductGrid from '@/components/products/ProductGrid';

interface Props {
  params: Promise<{ brandSlug: string; modelSlug: string; genSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, modelSlug, genSlug } = await params;
  try {
    const [generation, models] = await Promise.all([
      getCatalogGeneration(brandSlug, modelSlug, genSlug, 'az'),
      getCatalogModels(brandSlug, 'az'),
    ]);
    const brandName = models[0]?.brand?.name ?? brandSlug;
    const modelName = models.find((m) => m.slug === modelSlug)?.name ?? modelSlug;
    const yearRange = generation.year_from
      ? generation.year_to
        ? `${generation.year_from}-${generation.year_to}`
        : `${generation.year_from}-hal-hazırda`
      : '';
    const title = `${brandName} ${modelName} ${generation.name} ${yearRange ? `(${yearRange})` : ''} | 4WD.az`;
    const description = `${brandName} ${modelName} ${generation.name} texniki xüsusiyyətləri, şəkilləri və aksessuarları.`;
    const heroImage = getImageUrl(generation.image) ?? undefined;
    return {
      title,
      description,
      alternates: {
        canonical: `https://4wd.az/4x4-gallery/${brandSlug}/${modelSlug}/${genSlug}`,
      },
      openGraph: {
        title,
        description,
        url: `https://4wd.az/4x4-gallery/${brandSlug}/${modelSlug}/${genSlug}`,
        type: 'website',
        siteName: '4WD.az',
        images: heroImage ? [heroImage] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: heroImage ? [heroImage] : [],
      },
    };
  } catch {
    return { title: '4x4 Model | 4WD.az' };
  }
}

export default async function CatalogGenerationDetailPage({ params }: Props) {
  const { brandSlug, modelSlug, genSlug } = await params;
  const t = getTranslation();

  let generation: Awaited<ReturnType<typeof getCatalogGeneration>> | null = null;
  let products: Awaited<ReturnType<typeof getCatalogGenerationProducts>> = [];
  let brandName = brandSlug;
  let modelName = modelSlug;

  try {
    const [gen, models, prods] = await Promise.allSettled([
      getCatalogGeneration(brandSlug, modelSlug, genSlug, 'az'),
      getCatalogModels(brandSlug, 'az'),
      getCatalogGenerationProducts(brandSlug, modelSlug, genSlug, 'az'),
    ]);

    if (gen.status === 'fulfilled') {
      generation = gen.value;
    } else {
      notFound();
    }

    if (models.status === 'fulfilled' && models.value.length > 0) {
      brandName = models.value[0]?.brand?.name ?? brandSlug;
      modelName = models.value.find((m) => m.slug === modelSlug)?.name ?? modelSlug;
    }

    if (prods.status === 'fulfilled') {
      products = prods.value;
    }
  } catch {
    notFound();
  }

  if (!generation) {
    notFound();
  }

  const yearRange = generation.year_from
    ? generation.year_to
      ? `${generation.year_from} - ${generation.year_to}`
      : `${generation.year_from} - ${t.catalog.present}`
    : '';
  const heroImageUrl = getImageUrl(generation.image);
  const specGroups = generation.specs ?? {};
  const galleryImages = generation.images ?? [];

  const fullTitle = `${brandName} ${modelName} ${generation.name}`;
  const canonicalUrl = `https://4wd.az/4x4-gallery/${brandSlug}/${modelSlug}/${genSlug}`;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.nav.home, item: 'https://4wd.az/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.catalog.title,
        item: 'https://4wd.az/4x4-gallery',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: brandName,
        item: `https://4wd.az/4x4-gallery/${brandSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: modelName,
        item: `https://4wd.az/4x4-gallery/${brandSlug}/${modelSlug}`,
      },
      { '@type': 'ListItem', position: 5, name: generation.name },
    ],
  };

  const vehicleLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: fullTitle,
    brand: { '@type': 'Brand', name: brandName },
    model: modelName,
    vehicleModelDate: generation.year_from ? String(generation.year_from) : undefined,
    image: heroImageUrl ?? undefined,
    url: canonicalUrl,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={vehicleLd} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link href="/" className="hover:text-orange-500 transition-colors">
          {t.nav.home}
        </Link>
        <span>/</span>
        <Link href="/4x4-gallery" className="hover:text-orange-500 transition-colors">
          {t.catalog.title}
        </Link>
        <span>/</span>
        <Link
          href={`/4x4-gallery/${brandSlug}`}
          className="hover:text-orange-500 transition-colors"
        >
          {brandName}
        </Link>
        <span>/</span>
        <Link
          href={`/4x4-gallery/${brandSlug}/${modelSlug}`}
          className="hover:text-orange-500 transition-colors"
        >
          {modelName}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {generation.name}
        </span>
      </nav>

      {/* Hero section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Hero image */}
        <div className="relative aspect-[16/10] bg-gray-50 rounded-2xl overflow-hidden">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={`${fullTitle} ${yearRange}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-300 text-4xl font-black">4WD</span>
            </div>
          )}
        </div>

        {/* Title & basic info */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
            {fullTitle}
          </h1>
          {yearRange && (
            <p className="text-xl text-orange-500 font-bold mb-4">{yearRange}</p>
          )}
          <p className="text-gray-500">
            {t.catalog.subtitle}
          </p>
        </div>
      </div>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            {t.catalog.gallery}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {galleryImages.map((img, idx) => {
              const imgUrl = getImageUrl(img.image);
              if (!imgUrl) return null;
              return (
                <div
                  key={idx}
                  className="relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden group"
                >
                  <Image
                    src={imgUrl}
                    alt={img.alt_text ?? `${fullTitle} - ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Specs */}
      {Object.keys(specGroups).length > 0 ? (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            {t.catalog.specs}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(specGroups).map(([groupName, specs]) => (
              <div
                key={groupName}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
              >
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                    {groupName}
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-5 py-3 text-sm"
                    >
                      <span className="text-gray-500">{spec.key}</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            {t.catalog.specs}
          </h2>
          <p className="text-gray-400">{t.catalog.noSpecs}</p>
        </section>
      )}

      {/* Compatible products */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {t.catalog.accessories}
        </h2>
        {products && products.length > 0 ? (
          <ProductGrid products={products} t={t} locale="az" />
        ) : (
          <p className="text-gray-400">{t.catalog.noProducts}</p>
        )}
      </section>

      {/* Back link */}
      <div className="pt-6 border-t border-gray-100">
        <Link
          href={`/4x4-gallery/${brandSlug}/${modelSlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
        >
          &larr; {brandName} {modelName}
        </Link>
      </div>
    </div>
  );
}
