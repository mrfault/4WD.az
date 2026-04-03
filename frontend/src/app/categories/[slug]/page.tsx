import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Locale, FilterParams } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getCategoryBySlug, getProducts, getVehicleBrands } from '@/lib/api';
import ProductsPageClient from '@/app/products/_client';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params as any;
  try {
    const category = await getCategoryBySlug(slug, 'az');
    const name =
      'az' === 'az' ? category.name_az || category.name : category.name_en || category.name;
    return { title: name };
  } catch {
    return { title: 'Category' };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const locale = 'az';
  const { slug } = await params as any;
  const sp = await searchParams;
  
  const t = getTranslation();

  let category;
  try {
    category = await getCategoryBySlug(slug, 'az');
  } catch {
    notFound();
  }

  const categoryName =
    'az' === 'az' ? category.name_az || category.name : category.name_en || category.name;

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
    getProducts('az', filters),
    getVehicleBrands('az'),
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
            <Link href={`/`} className="hover:text-white transition-colors">
              {t.nav.home}
            </Link>
            <span>/</span>
            <Link href={`/products`} className="hover:text-white transition-colors">
              {t.nav.products}
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{categoryName}</span>
          </nav>
          <h1 className="text-3xl font-black text-white">{categoryName}</h1>
          {(category.description_az || category.description_en || category.description) && (
            <p className="text-gray-400 mt-2 max-w-2xl">
              {'az' === 'az'
                ? category.description_az ?? category.description
                : category.description_en ?? category.description}
            </p>
          )}
        </div>
      </div>

      <ProductsPageClient
        t={t}
        locale={'az'}
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
