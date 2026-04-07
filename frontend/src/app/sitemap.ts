import type { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/lib/constants';

const SITE_URL = 'https://4wd.az';

async function fetchAllProducts(): Promise<
  Array<{ slug: string; updated_at: string; category?: { slug: string } }>
> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/?per_page=1000`, {
      headers: { 'Accept-Language': 'az' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchAllCategories(): Promise<
  Array<{ slug: string }>
> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/`, {
      headers: { 'Accept-Language': 'az' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchAllBlogPosts(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/?per_page=1000`, {
      headers: { 'Accept-Language': 'az' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blogPosts] = await Promise.all([
    fetchAllProducts(),
    fetchAllCategories(),
    fetchAllBlogPosts(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const productPages: MetadataRoute.Sitemap = products
    .filter((product) => product.category?.slug)
    .map((product) => ({
      url: `${SITE_URL}/categories/${product.category!.slug}/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
