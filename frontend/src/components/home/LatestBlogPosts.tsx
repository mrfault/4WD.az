import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import type { Locale, BlogPost } from '@/types';
import type { Translations } from '@/i18n/az';
import { getImageUrl, formatDate, truncate } from '@/lib/utils';
import SectionHeader from '@/components/shared/SectionHeader';

interface LatestBlogPostsProps {
  t: Translations;
  locale: Locale;
  posts: BlogPost[];
}

export default function LatestBlogPosts({ t, locale, posts }: LatestBlogPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.home.latestBlog}
          subtitle={t.home.latestBlogSubtitle}
          action={
            <Link
              href={`/${locale}/blog`}
              className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              {t.home.viewAllBlog}
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post) => {
            const title = locale === 'az' ? post.title_az || post.title : post.title_en || post.title;
            const excerpt =
              locale === 'az'
                ? post.excerpt_az ?? post.excerpt
                : post.excerpt_en ?? post.excerpt;
            const imageUrl = getImageUrl(post.featured_image);

            return (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-gray-100">
                      <span className="text-orange-300 text-4xl font-black">4WD</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {post.published_at && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.published_at, locale)}
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-orange-600 transition-colors">
                    {title}
                  </h3>
                  {excerpt && (
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                      {truncate(excerpt, 120)}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-orange-500 group-hover:gap-2 transition-all">
                    {t.common.readMore}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
