import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslation } from '@/lib/getTranslation';
import { getCatalogBrands } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import JsonLd from '@/components/shared/JsonLd';

export const metadata: Metadata = {
  title: '4x4 Kataloq | 4WD.az',
  description:
    'Offroad avtomobillərinin tam kataloqu. Bütün 4x4 brendlər, modellər və nəsillər haqqında məlumat.',
  alternates: { canonical: 'https://4wd.az/4x4-gallery' },
  openGraph: {
    title: '4x4 Kataloq | 4WD.az',
    description:
      'Offroad avtomobillərinin tam kataloqu. Bütün 4x4 brendlər, modellər və nəsillər.',
    url: 'https://4wd.az/4x4-gallery',
    type: 'website',
    siteName: '4WD.az',
  },
};

export default async function CatalogBrandsPage() {
  const t = getTranslation();

  let brands: Awaited<ReturnType<typeof getCatalogBrands>> = [];
  try {
    brands = await getCatalogBrands('az');
  } catch {
    // fail gracefully
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.nav.home, item: 'https://4wd.az/' },
      { '@type': 'ListItem', position: 2, name: t.catalog.title },
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
        <span className="text-gray-900 font-medium">{t.catalog.title}</span>
      </nav>

      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          {t.catalog.title}
        </h1>
        <p className="text-gray-500 text-lg">{t.catalog.subtitle}</p>
      </div>

      {/* Brands grid */}
      {brands.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {brands.map((brand) => {
            const logoUrl = getImageUrl(brand.logo);
            return (
              <Link
                key={brand.id}
                href={`/4x4-gallery/${brand.slug}`}
                className="group flex flex-col items-center gap-3 p-5 sm:p-6 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  {logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={logoUrl}
                      alt={`${brand.name} logo`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-orange-50 flex items-center justify-center">
                      <span className="text-orange-500 text-2xl font-black">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors">
                    {brand.name}
                  </h2>
                  {brand.country && (
                    <p className="text-xs text-gray-400 mt-0.5">{brand.country}</p>
                  )}
                  <p className="text-xs text-orange-500 font-semibold mt-1">
                    {brand.models_count} {t.catalog.models}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-gray-500 font-medium text-lg">{t.common.noResults}</p>
        </div>
      )}
    </div>
  );
}
