import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/getTranslation';
import { getCatalogGenerations, getCatalogModels } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import JsonLd from '@/components/shared/JsonLd';

interface Props {
  params: Promise<{ brandSlug: string; modelSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, modelSlug } = await params;
  try {
    const [generations, models] = await Promise.all([
      getCatalogGenerations(brandSlug, modelSlug, 'az'),
      getCatalogModels(brandSlug, 'az'),
    ]);
    const brandName = models[0]?.brand?.name ?? brandSlug;
    const modelName = models.find((m) => m.slug === modelSlug)?.name ?? modelSlug;
    const title = `${brandName} ${modelName} Nəsilləri | 4WD.az`;
    const description = `${brandName} ${modelName} offroad avtomobilinin bütün nəsilləri. ${generations.length} nəsil haqqında məlumat.`;
    return {
      title,
      description,
      alternates: { canonical: `https://4wd.az/4x4-gallery/${brandSlug}/${modelSlug}` },
      openGraph: {
        title,
        description,
        url: `https://4wd.az/4x4-gallery/${brandSlug}/${modelSlug}`,
        type: 'website',
        siteName: '4WD.az',
      },
    };
  } catch {
    return { title: '4x4 Nəsillər | 4WD.az' };
  }
}

export default async function CatalogGenerationsPage({ params }: Props) {
  const { brandSlug, modelSlug } = await params;
  const t = getTranslation();

  let generations: Awaited<ReturnType<typeof getCatalogGenerations>> = [];
  let brandName = brandSlug;
  let modelName = modelSlug;

  try {
    const [gens, models] = await Promise.all([
      getCatalogGenerations(brandSlug, modelSlug, 'az'),
      getCatalogModels(brandSlug, 'az'),
    ]);
    generations = gens;
    brandName = models[0]?.brand?.name ?? brandSlug;
    modelName = models.find((m) => m.slug === modelSlug)?.name ?? modelSlug;
  } catch {
    notFound();
  }

  const hasGenerations = generations && generations.length > 0;

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
      { '@type': 'ListItem', position: 4, name: modelName },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={breadcrumbLd} />

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
        <span className="text-gray-900 font-medium">{modelName}</span>
      </nav>

      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          {brandName} {modelName}
        </h1>
        <p className="text-gray-500">
          {generations.length} {t.catalog.generations}
        </p>
      </div>

      {/* Generations grid */}
      {!hasGenerations ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-gray-400 text-lg font-medium">Bu model üçün hələ məlumat əlavə olunmayıb</p>
          <Link href={`/4x4-gallery/${brandSlug}`} className="mt-4 text-orange-500 hover:text-orange-600 font-semibold text-sm">
            ← Modellərə qayıt
          </Link>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {generations.map((gen) => {
          const imageUrl = getImageUrl(gen.image);
          const yearRange = gen.year_from
            ? gen.year_to
              ? `${gen.year_from} - ${gen.year_to}`
              : `${gen.year_from} - ${t.catalog.present}`
            : '';
          return (
            <Link
              key={gen.id}
              href={`/4x4-gallery/${brandSlug}/${modelSlug}/${gen.slug}`}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`${brandName} ${modelName} ${gen.name}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-300 text-2xl font-black">4WD</span>
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5">
                <h2 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-orange-600 transition-colors">
                  {gen.name}
                </h2>
                {yearRange && (
                  <p className="text-sm text-orange-500 font-semibold mt-1">{yearRange}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}
