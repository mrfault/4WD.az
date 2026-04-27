import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories } from '@/lib/api';
import { getTranslation } from '@/lib/getTranslation';
import { STORAGE_BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Kateqoriyalar',
  description:
    'Offroad aksessuarları kateqoriyaları - lift kit, bamper, winch, LED işıqlar, asqı sistemləri və daha çoxu. 4WD.az-da bütün kateqoriyalara baxın.',
  alternates: { canonical: 'https://4wd.az/categories' },
  openGraph: {
    title: 'Kateqoriyalar | 4WD.az',
    description:
      'Offroad aksessuarları kateqoriyaları - lift kit, bamper, winch, LED işıqlar və daha çoxu.',
    url: 'https://4wd.az/categories',
    type: 'website',
    siteName: '4WD.az',
  },
};

export default async function CategoriesPage() {
  const t = getTranslation();
  const allCategories = await getCategories('az');
  const categories = allCategories.filter((cat) => !cat.parent_id);

  return (
    <div>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              {t.nav.home}
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{t.nav.categories}</span>
          </nav>
          <h1 className="text-3xl font-black text-white">{t.nav.categories}</h1>
          <p className="text-gray-400 mt-2">
            Offroad aksessuarları və 4x4 avadanlıqları üzrə bütün kateqoriyalar
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const name = cat.name_az || cat.name;
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500 transition-all duration-300"
              >
                {cat.image ? (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={
                        cat.image.startsWith('http')
                          ? cat.image
                          : `${STORAGE_BASE_URL}${cat.image.startsWith('/') ? '' : '/'}${cat.image}`
                      }
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gray-800 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-white font-semibold group-hover:text-orange-500 transition-colors">
                    {name}
                  </h2>
                  {cat.product_count !== undefined && cat.product_count > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      {cat.product_count} məhsul
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
