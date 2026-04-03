import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getBlogPosts } from '@/lib/api';
import { getImageUrl, formatDate, truncate } from '@/lib/utils';
import BlogPagination from './_pagination';

interface BlogPageProps {
  params: Promise<{}>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  
  const t = getTranslation();
  return { title: t.blog.title };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  
  const { page: pageParam } = await searchParams;
  
  const t = getTranslation();
  const currentPage = pageParam ? parseInt(pageParam) : 1;

  let postsRes;
  try {
    postsRes = await getBlogPosts('az', currentPage);
  } catch {
    postsRes = { data: [], meta: { current_page: 1, last_page: 1, per_page: 9, total: 0, from: null, to: null }, links: { first: null, last: null, prev: null, next: null } };
  }

  const posts = postsRes.data;
  const totalPages = postsRes.meta.last_page;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-gray-900">{t.blog.title}</h1>
        <p className="text-gray-500 mt-3 text-lg">{t.blog.subtitle}</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <p className="text-lg font-medium">{t.blog.noPosts}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const title =
                'az' === 'az' ? post.title_az || post.title : post.title_en || post.title;
              const excerpt =
                'az' === 'az'
                  ? post.excerpt_az ?? post.excerpt
                  : post.excerpt_en ?? post.excerpt;
              const imageUrl = getImageUrl(post.featured_image);

              return (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  {/* Image */}
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative h-52 bg-gray-100 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-gray-100 flex items-center justify-center">
                          <span className="text-orange-300 text-4xl font-black">4WD</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {post.published_at && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.published_at, 'az')}
                      </div>
                    )}

                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-orange-600 transition-colors mb-3">
                        {title}
                      </h2>
                    </Link>

                    {excerpt && (
                      <p className="text-gray-500 text-sm leading-relaxed flex-1">
                        {truncate(excerpt, 150)}
                      </p>
                    )}

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-orange-500 hover:gap-2.5 transition-all"
                    >
                      {t.blog.readMore}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <BlogPagination
              locale={'az'}
              currentPage={currentPage}
              totalPages={totalPages}
              t={t}
            />
          )}
        </>
      )}
    </div>
  );
}
