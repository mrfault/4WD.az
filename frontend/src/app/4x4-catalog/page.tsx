import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslation } from '@/lib/getTranslation';
import { getVehicleBrands } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

export const metadata: Metadata = {
  title: '4x4 Kataloq | 4WD.az',
  description: 'Offroad avtomobillərinin texniki xüsusiyyətləri - Toyota, Nissan, Jeep, Land Rover və digər 4x4 brendlər.',
};

export default async function CatalogPage() {
  const t = getTranslation();
  let brands: Awaited<ReturnType<typeof getVehicleBrands>> = [];

  try {
    brands = await getVehicleBrands('az');
  } catch {
    brands = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          {t.catalog.title}
        </h1>
        <p className="text-gray-500">{t.catalog.subtitle}</p>
      </div>

      {brands.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand) => {
            const logoUrl = getImageUrl(brand.logo);
            return (
              <Link
                key={brand.id}
                href={`/4x4-catalog/${brand.slug}`}
                className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 group"
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={brand.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-black text-gray-300">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {brand.name}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-16">Brendlər hələ əlavə olunmayıb</p>
      )}
    </div>
  );
}
