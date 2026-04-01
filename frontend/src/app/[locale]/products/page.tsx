import type { Metadata } from 'next';
import type { Locale, FilterParams } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getProducts, getCategories, getVehicleBrands } from '@/lib/api';
import ProductsPageClient from './_client';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslation(locale as Locale);
  return { title: t.nav.products };
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const safeLocale = locale as Locale;
  const t = getTranslation(safeLocale);

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
    getProducts(safeLocale, filters),
    getCategories(safeLocale),
    getVehicleBrands(safeLocale),
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
      locale={safeLocale}
      initialProducts={products}
      categories={cats}
      brands={vehicleBrands}
      initialFilters={filters}
    />
  );
}
