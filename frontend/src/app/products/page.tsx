import type { Metadata } from 'next';
import type { Locale, FilterParams } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getProducts, getCategories, getVehicleBrands } from '@/lib/api';
import ProductsPageClient from './_client';

interface ProductsPageProps {
  params: Promise<{}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  
  const t = getTranslation();
  return { title: t.nav.products };
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  
  const sp = await searchParams;
  
  const t = getTranslation();

  // Build filter params from search params
  const filters: FilterParams = {
    category: sp['category'] as string | undefined,
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

  const [productsRes, categories, brands] = await Promise.allSettled([
    getProducts('az', filters),
    getCategories('az'),
    getVehicleBrands('az'),
  ]);

  const products =
    productsRes.status === 'fulfilled'
      ? productsRes.value
      : { data: [], meta: { current_page: 1, last_page: 1, per_page: 12, total: 0, from: null, to: null }, links: { first: null, last: null, prev: null, next: null } };
  const cats = categories.status === 'fulfilled' ? categories.value : [];
  const vehicleBrands = brands.status === 'fulfilled' ? brands.value : [];

  return (
    <ProductsPageClient
      t={t}
      locale={'az'}
      initialProducts={products}
      categories={cats}
      brands={vehicleBrands}
      initialFilters={filters}
    />
  );
}
