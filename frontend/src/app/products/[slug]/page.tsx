import type { Metadata } from 'next';
import { permanentRedirect, notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/api';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params as any;
  try {
    const product = await getProductBySlug(slug, 'az');
    const categorySlug = product.category?.slug;
    if (categorySlug) {
      const canonicalUrl = `https://4wd.az/categories/${categorySlug}/${slug}`;
      return {
        alternates: { canonical: canonicalUrl },
      };
    }
    return { title: 'Redirecting...' };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailRedirect({ params }: ProductPageProps) {
  const { slug } = await params as any;

  let product: any;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/products/${slug}`,
      {
        headers: { 'Accept-Language': 'az' },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) notFound();
    const json = await res.json();
    product = json.data;
  } catch {
    notFound();
  }

  const categorySlug = product.category?.slug;
  if (!categorySlug) {
    notFound();
  }

  permanentRedirect(`/categories/${categorySlug}/${slug}`);
}
