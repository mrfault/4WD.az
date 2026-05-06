import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/getTranslation';
import { getCatalogBrandModels } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface Props {
  params: Promise<{ brandSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  try {
    const { brand } = await getCatalogBrandModels(brandSlug, 'az');
    const canonicalUrl = `https://4wd.az/4x4-catalog/${brandSlug}`;
    return {
      title: `${brand.name} 4x4 Modellər`,
      description: `${brand.name} offroad avtomobillərinin bütün modelləri və nəsilləri.`,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${brand.name} 4x4 Modellər | 4WD.az`,
        description: `${brand.name} offroad avtomobillərinin bütün modelləri və nəsilləri.`,
        url: canonicalUrl,
        type: 'website',
        siteName: '4WD.az',
      },
    };
  } catch {
    return { title: '4x4 Kataloq | 4WD.az' };
  }
}

export default async function BrandModelsPage({ params }: Props) {
  const { brandSlug } = await params;
  const t = getTranslation();

  let models: Awaited<ReturnType<typeof getCatalogBrandModels>>['data'] = [];
  let brand: Awaited<ReturnType<typeof getCatalogBrandModels>>['brand'] | null = null;

  try {
    const res = await getCatalogBrandModels(brandSlug, 'az');
    models = res.data;
    brand = res.brand;
  } catch {
    notFound();
  }

  if (!brand) notFound();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Səhifə', item: 'https://4wd.az' },
      { '@type': 'ListItem', position: 2, name: '4x4 Kataloq', item: 'https://4wd.az/4x4-catalog' },
      { '@type': 'ListItem', position: 3, name: brand.name },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brand.name} 4x4 Modellər`,
    description: `${brand.name} offroad avtomobillərinin bütün modelləri və nəsilləri.`,
    url: `https://4wd.az/4x4-catalog/${brandSlug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: models.flatMap((model) =>
        model.generations.map((gen, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://4wd.az/4x4-catalog/${brandSlug}/${gen.slug}`,
          name: `${brand.name} ${model.name} ${gen.name}`,
        }))
      ),
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-orange-500 transition-colors">{t.nav.home}</Link>
        <span>/</span>
        <Link href="/4x4-catalog" className="hover:text-orange-500 transition-colors">{t.catalog.title}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{brand.name}</span>
      </nav>

      <div className="flex items-center gap-4 mb-10">
        {brand.logo && (
          <Image
            src={getImageUrl(brand.logo)!}
            alt={brand.name}
            width={56}
            height={56}
            className="object-contain"
          />
        )}
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">{brand.name}</h1>
      </div>

      {models.length > 0 ? (
        <div className="space-y-10">
          {models.map((model) => (
            <div key={model.id}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {brand.name} {model.name}
              </h2>

              {model.generations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {model.generations.map((gen) => {
                    const imgUrl = getImageUrl(gen.image);
                    const yearTo = gen.year_to ?? t.catalog.present;
                    return (
                      <Link
                        key={gen.id}
                        href={`/4x4-catalog/${brandSlug}/${gen.slug}`}
                        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
                      >
                        <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={`${brand.name} ${model.name} ${gen.name}`}
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
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {gen.name}
                          </h3>
                          <p className="text-sm text-orange-500 font-semibold mt-1">
                            {gen.year_from} - {yearTo}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Nəsillər hələ əlavə olunmayıb</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-16">Bu brend üçün hələ model əlavə olunmayıb</p>
      )}

      <div className="pt-8 border-t border-gray-100 mt-10">
        <Link
          href="/4x4-catalog"
          className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
        >
          &larr; {t.catalog.allBrands}
        </Link>
      </div>
    </div>
  );
}
