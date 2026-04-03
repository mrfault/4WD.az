import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowLeft, User } from 'lucide-react';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getBlogPostBySlug } from '@/lib/api';
import { getImageUrl, formatDate } from '@/lib/utils';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params as any;
  try {
    const post = await getBlogPostBySlug(slug, 'az');
    const title =
      'az' === 'az' ? post.title_az || post.title : post.title_en || post.title;
    const excerpt =
      'az' === 'az' ? post.excerpt_az ?? post.excerpt : post.excerpt_en ?? post.excerpt;
    const imageUrl = getImageUrl(post.featured_image);
    return {
      title,
      description: excerpt ?? title,
      openGraph: {
        title,
        description: excerpt ?? undefined,
        images: imageUrl ? [imageUrl] : [],
        type: 'article',
        publishedTime: post.published_at ?? undefined,
      },
    };
  } catch {
    return { title: 'Blog' };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const locale = 'az';
  const { slug } = await params as any;
  
  const t = getTranslation();

  let post;
  try {
    post = await getBlogPostBySlug(slug, 'az');
  } catch {
    notFound();
  }

  const title =
    'az' === 'az' ? post.title_az || post.title : post.title_en || post.title;

  const content =
    'az' === 'az' ? post.content_az || post.content : post.content_en || post.content;

  const imageUrl = getImageUrl(post.featured_image);

  return (
    <article>
      {/* Hero banner */}
      {imageUrl && (
        <div className="relative h-64 sm:h-80 md:h-96 bg-gray-900 overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover opacity-70"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href={`/blog`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.blog.backToBlog}
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at, 'az')}
              </span>
            )}
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
            )}
          </div>
        </header>

        {/* Featured image (if no hero banner) */}
        {imageUrl && !imageUrl && (
          <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Back to blog */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link
            href={`/blog`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.blog.backToBlog}
          </Link>
        </div>
      </div>
    </article>
  );
}
