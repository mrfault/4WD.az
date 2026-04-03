'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Locale, GalleryItem } from '@/types';
import type { Translations } from '@/i18n/az';
import { getImageUrl } from '@/lib/utils';
import SectionHeader from '@/components/shared/SectionHeader';

interface GalleryPreviewProps {
  t: Translations;
  locale: Locale;
  items: GalleryItem[];
}

export default function GalleryPreview({ t, locale, items }: GalleryPreviewProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (items.length === 0) return null;

  const getTitle = (item: GalleryItem) =>
    locale === 'az' ? item.title_az || item.title : item.title_en || item.title;

  function prev() {
    setLightbox((i) => (i !== null ? (i - 1 + items.length) % items.length : null));
  }
  function next() {
    setLightbox((i) => (i !== null ? (i + 1) % items.length : null));
  }

  let touchStartX = 0;
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      if (delta < 0) next();
      else prev();
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.home.galleryPreview}
          subtitle={t.home.galleryPreviewSubtitle}
          action={
            <Link
              href="/gallery"
              className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              {t.home.viewGallery}
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />

        {/* Single row of small squares */}
        <div
          className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => {
            const imageUrl = getImageUrl(item.image);
            return (
              <button
                key={item.id}
                onClick={() => setLightbox(index)}
                className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-xl overflow-hidden group snap-start"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={getTitle(item)}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="144px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-xs font-bold">4WD</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={() => setLightbox(null)}
          >
            <div className="flex justify-end p-3">
              <button
                onClick={() => setLightbox(null)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div
              className="flex-1 relative flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={lightbox}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center px-4"
                >
                  {getImageUrl(items[lightbox].image) && (
                    <div className="relative w-full h-full max-w-4xl">
                      <Image
                        src={getImageUrl(items[lightbox].image)!}
                        alt={getTitle(items[lightbox])}
                        fill
                        className="object-contain"
                        sizes="95vw"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {items.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 sm:p-3 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 sm:p-3 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Counter + title */}
            <div className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
              <p className="text-white font-semibold">{getTitle(items[lightbox])}</p>
              <span className="text-white/50 text-sm">
                {lightbox + 1} / {items.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
