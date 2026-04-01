import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Locale, FilterParams } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getCategoryBySlug, getProducts, getVehicleBrands } from '@/lib/api';
import ProductsPageClient from '@/app/[locale]/products/_client';

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const category = await getCategoryBySlug(slug, locale as Locale);
    const name =
      locale === 'az' ? category.name_az || category.name : category.name_en || category.name;
    return { title: name };
  } catch {
    return { title: 'Category' };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const safeLocale = locale as Locale;
  const t = getTranslation(safeLocale);

  let category;
  try {
    category = await getCategoryBySlug(slug, safeLocale);
  } catch {
    notFound();
  }

  const categoryName =
    safeLocale === 'az' ? category.name_az || category.name : category.name_en || category.name;

  const filters: FilterParams = {
    category: slug,
    brand: sp['brand'] as string | undefined,
    model: sp['model'] as string | undefined,
    min_price: sp['min_price'] as string | undefined,
    max_price: sp['max_price'] as string | undefined,
    stock_status: sp['stock_status'] as FilterParams['stock_status'],
    is_hot_sale: sp['is_hot_sale'] === 'true',
    is_discounted: sp['is_discounted'] === 'true',
    search: sp['search'] as string | undefined,
    ordering: (sp['ordering'] as string) ?? '-created_at',
    page: sp['page'] ? parseInt(sp['page'] as string) : 1,
  };

  const [productsRes, brands] = await Promise.allSettled([
    getProducts(safeLocale, filters),
    getVehicleBrands(safeLocale),
  ]);

  const products =
    productsRes.status === 'fulfilled'
      ? productsRes.value
      : { data: [], meta: { current_page: 1, last_page: 1, per_page: 12, total: 0, from: null, to: null }, links: { first: null, last: null, prev: null, next: null } };
  const vehicleBrands = brands.status === 'fulfilled' ? brands.value : [];

  // Pass empty categories array since we're already scoped to this category
  return (
    <div>
      {/* Category hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href={`/${safeLocale}`} className="hover:text-white transition-colors">
              {t.nav.home}
            </Link>
            <span>/</span>
            <Link href={`/${safeLocale}/products`} className="hover:text-white transition-colors">
              {t.nav.products}
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{categoryName}</span>
          </nav>
          <h1 className="text-3xl font-black text-white">{categoryName}</h1>
          {(category.description_az || category.description_en || category.description) && (
            <p className="text-gray-400 mt-2 max-w-2xl">
              {safeLocale === 'az'
                ? category.description_az ?? category.description
                : category.description_en ?? category.description}
            </p>
          )}
        </div>
      </div>

      <ProductsPageClient
        t={t}
        locale={safeLocale}
        initialProducts={products}
        categories={[]}
        brands={vehicleBrands}
        initialFilters={filters}
        fixedCategory={slug}
        categoryName={categoryName}
      />
    </div>
  );
}
