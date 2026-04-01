'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { ProductImage } from '@/types';
import { getImageUrl } from '@/lib/utils';
import type { Translations } from '@/i18n/az';
import { AnimatePresence, motion } from 'framer-motion';

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  t: Translations;
}

export default function ProductGallery({ images, title, t }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-300 text-4xl font-black">4WD</span>
      </div>
    );
  }

  const current = images[selected];
  const currentUrl = getImageUrl(current.image);

  function prev() {
    setSelected((s) => (s - 1 + images.length) % images.length);
  }

  function next() {
    setSelected((s) => (s + 1) % images.length);
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in group"
        onClick={() => setLightbox(true)}
      >
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={current.alt_text ?? title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-300 text-4xl font-black">4WD</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
          <ZoomIn className="w-8 h-8 text-white drop-shadow" />
        </div>
        {/* Prev/next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => {
            const url = getImageUrl(img.image);
            return (
              <button
                key={img.id}
                onClick={() => setSelected(index)}
                className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  selected === index
                    ? 'border-orange-500 shadow-md'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {url ? (
                  <Image
                    src={url}
                    alt={img.alt_text ?? `${title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-xs">4WD</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && currentUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-3xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
                <Image
                  src={currentUrl}
                  alt={current.alt_text ?? title}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
              <button
                onClick={() => setLightbox(false)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                aria-label={t.common.close}
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
