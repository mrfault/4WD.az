import { API_BASE_URL } from './constants';
import type {
  Category,
  Product,
  ProductList,
  PaginatedResponse,
  GalleryItem,
  BlogPost,
  Lead,
  LeadFormData,
  VehicleBrand,
  VehicleModel,
  Settings,
  FilterParams,
  Locale,
} from '@/types';

async function fetchRaw<T>(path: string, locale: Locale, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
      ...(init?.headers as Record<string, string> | undefined),
    },
    ...init,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

// For non-paginated endpoints: unwrap Laravel's { data: ... } envelope
async function fetcher<T>(path: string, locale: Locale, init?: RequestInit): Promise<T> {
  const json = await fetchRaw<{ data: T }>(path, locale, init);
  return json.data;
}

// For paginated endpoints: return full { data, meta, links } as-is
async function fetchPaginated<T>(path: string, locale: Locale, init?: RequestInit): Promise<PaginatedResponse<T>> {
  return fetchRaw<PaginatedResponse<T>>(path, locale, init);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(locale: Locale): Promise<Category[]> {
  return fetcher<Category[]>('/categories/', locale);
}

export async function getCategoryBySlug(slug: string, locale: Locale): Promise<Category> {
  return fetcher<Category>(`/categories/${slug}/`, locale);
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function buildProductQuery(params: FilterParams): string {
  const q = new URLSearchParams();
  // Map frontend param names to backend param names
  if (params.category) q.set('category_slug', params.category);
  if (params.brand) q.set('brand_slug', params.brand);
  if (params.model) q.set('model_slug', params.model);
  if (params.min_price) q.set('price_min', params.min_price);
  if (params.max_price) q.set('price_max', params.max_price);
  if (params.stock_status) q.set('stock_status', params.stock_status);
  if (params.is_hot_sale) q.set('is_hot_sale', 'true');
  if (params.is_discounted) q.set('is_discounted', 'true');
  if (params.search) q.set('search', params.search);
  if (params.ordering) {
    // Map frontend ordering values to backend sort values
    const sortMap: Record<string, string> = {
      '-created_at': 'newest',
      'price': 'price_asc',
      '-price': 'price_desc',
      'random': 'random',
      'title': 'newest',
    };
    q.set('sort', sortMap[params.ordering] ?? 'newest');
  }
  if (params.page && params.page > 1) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

export async function getProducts(
  locale: Locale,
  params: FilterParams = {}
): Promise<PaginatedResponse<ProductList>> {
  const qs = buildProductQuery(params);
  return fetchPaginated<ProductList>(`/products/${qs}`, locale);
}

export async function getProductBySlug(slug: string, locale: Locale): Promise<Product> {
  return fetcher<Product>(`/products/${slug}/`, locale);
}

export async function getHotSaleProducts(
  locale: Locale,
  limit = 6
): Promise<PaginatedResponse<ProductList>> {
  return fetchPaginated<ProductList>(
    `/products/?is_hot_sale=true&per_page=${limit}`,
    locale
  );
}

export async function getDiscountedProducts(
  locale: Locale,
  limit = 6
): Promise<PaginatedResponse<ProductList>> {
  return fetchPaginated<ProductList>(
    `/products/?is_discounted=true&per_page=${limit}`,
    locale
  );
}

export async function getRelatedProducts(
  productSlug: string,
  locale: Locale
): Promise<ProductList[]> {
  try {
    return fetcher<ProductList[]>(`/products/${productSlug}/related/`, locale);
  } catch {
    return [];
  }
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export async function getGalleryItems(
  locale: Locale,
  params: { brand?: string; category?: string } = {}
): Promise<GalleryItem[]> {
  const q = new URLSearchParams();
  if (params.brand) q.set('brand_slug', params.brand);
  if (params.category) q.set('category_slug', params.category);
  const qs = q.toString();
  const res = await fetchPaginated<GalleryItem>(`/gallery/${qs ? `?${qs}` : ''}`, locale);
  return res.data ?? [];
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function getBlogPosts(
  locale: Locale,
  page = 1
): Promise<PaginatedResponse<BlogPost>> {
  return fetchPaginated<BlogPost>(
    `/blog/?page=${page}`,
    locale
  );
}

export async function getBlogPostBySlug(slug: string, locale: Locale): Promise<BlogPost> {
  return fetcher<BlogPost>(`/blog/${slug}/`, locale);
}

export async function getLatestBlogPosts(
  locale: Locale,
  limit = 3
): Promise<BlogPost[]> {
  const res = await fetchPaginated<BlogPost>(
    `/blog/?per_page=${limit}`,
    locale
  );
  return res.data ?? [];
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function createLead(data: LeadFormData): Promise<Lead> {
  const res = await fetch(`${API_BASE_URL}/leads/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json() as Promise<Lead>;
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export async function getVehicleBrands(locale: Locale): Promise<VehicleBrand[]> {
  return fetcher<VehicleBrand[]>('/vehicles/brands/', locale);
}

export async function getVehicleModels(
  locale: Locale,
  brandId?: number | string
): Promise<VehicleModel[]> {
  if (!brandId) return [];
  return fetcher<VehicleModel[]>(`/vehicles/brands/${brandId}/models/`, locale);
}

// ─── Catalog (4x4) ───────────────────────────────────────────────────────────

export async function getCatalogBrandModels(
  brandSlug: string,
  locale: Locale
): Promise<{ data: import('@/types').CatalogModel[]; brand: import('@/types').CatalogBrand }> {
  return fetchRaw<{ data: import('@/types').CatalogModel[]; brand: import('@/types').CatalogBrand }>(
    `/vehicles/brands/${brandSlug}/models-with-generations`,
    locale
  );
}

export async function getCatalogGenerationDetail(
  slug: string,
  locale: Locale
): Promise<import('@/types').CatalogGenerationDetail> {
  const res = await fetchRaw<{ data: import('@/types').CatalogGenerationDetail }>(
    `/vehicles/generations/${slug}`,
    locale
  );
  return res.data;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(locale: Locale): Promise<Settings> {
  return fetcher<Settings>('/settings/', locale);
}

