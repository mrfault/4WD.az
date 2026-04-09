import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/getTranslation';
import { getCatalogModels } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import JsonLd from '@/components/shared/JsonLd';

interface Props {
  params: Promise<{ brandSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  try {
    const models = await getCatalogModels(brandSlug, 'az');
    const brandName = models[0]?.brand?.name ?? brandSlug;
    const title = `${brandName} 4x4 Modellər | 4WD.az`;
    const description = `${brandName} offroad avtomobil modelləri. ${models.length} model haqqında məlumat.`;
    return {
      title,
      description,
      alternates: { canonical: `https://4wd.az/4x4-gallery/${brandSlug}` },
      openGraph: {
        title,
        description,
        url: `https://4wd.az/4x4-gallery/${brandSlug}`,
        type: 'website',
        siteName: '4WD.az',
      },
    };
  } catch {
    return { title: '4x4 Modellər | 4WD.az' };
  }
}

export default async function CatalogModelsPage({ params }: Props) {
  const { brandSlug } = await params;
  const t = getTranslation();

  let models: Awaited<ReturnType<typeof getCatalogModels>> = [];
  try {
    models = await getCatalogModels(brandSlug, 'az');
  } catch {
    notFound();
  }

  if (!models || models.length === 0) {
    notFound();
  }

  const brandName = models[0]?.brand?.name ?? brandSlug;

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
      { '@type': 'ListItem', position: 3, name: brandName },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={breadcrumbLd} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-orange-500 transition-colors">
          {t.nav.home}
        </Link>
        <span>/</span>
        <Link href="/4x4-gallery" className="hover:text-orange-500 transition-colors">
          {t.catalog.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{brandName}</span>
      </nav>

      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">{brandName}</h1>
        <p className="text-gray-500">
          {models.length} {t.catalog.models}
        </p>
      </div>

      {/* Models grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {models.map((model) => {
          const imageUrl = getImageUrl(model.image);
          return (
            <Link
              key={model.id}
              href={`/4x4-gallery/${brandSlug}/${model.slug}`}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`${brandName} ${model.name}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-300 text-2xl font-black">4WD</span>
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4">
                <h2 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors">
                  {model.name}
                </h2>
                {model.body_type && (
                  <p className="text-xs text-gray-400 mt-0.5">{model.body_type}</p>
                )}
                <p className="text-xs text-orange-500 font-semibold mt-1.5">
                  {model.generations_count} {t.catalog.generations}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
