'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import type { Translations } from '@/i18n/az';
import { AnimatePresence, motion } from 'framer-motion';

interface GalleryImage {
  id: number;
  url: string;
  alt_text?: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  title: string;
  t: Translations;
}

const swipeThreshold = 50;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function ProductGallery({ images = [], title, t }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-300 text-4xl font-black">4WD</span>
      </div>
    );
  }

  const current = images[selected];
  const currentUrl = current?.url || null;
  const hasMultiple = images.length > 1;

  function goTo(index: number, dir: number) {
    setDirection(dir);
    setSelected(index);
  }

  function prev() {
    const newIndex = (selected - 1 + images.length) % images.length;
    goTo(newIndex, -1);
  }

  function next() {
    const newIndex = (selected + 1) % images.length;
    goTo(newIndex, 1);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Only swipe if horizontal movement is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) next();
      else prev();
    }
  }

  function openLightbox(index?: number) {
    if (index !== undefined) {
      setSelected(index);
      setDirection(0);
    }
    setLightbox(true);
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in group"
        onClick={() => openLightbox()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={current.alt_text ?? title}
            fill
            className="object-contain"
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
        {hasMultiple && (
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
            {/* Dot indicators on mobile */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === selected ? 'bg-orange-500 w-4' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => goTo(index, index > selected ? 1 : -1)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                selected === index
                  ? 'border-orange-500 shadow-md'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {img.url ? (
                <Image
                  src={img.url}
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
          ))}
        </div>
      )}

      {/* Lightbox Slider */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={() => setLightbox(false)}
          >
            {/* Close button */}
            <div className="flex justify-end p-3">
              <button
                onClick={() => setLightbox(false)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                aria-label={t.common.close}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main slider area */}
            <div
              className="flex-1 relative flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={selected}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="absolute inset-0 flex items-center justify-center px-4"
                >
                  {images[selected]?.url && (
                    <div className="relative w-full h-full max-w-4xl">
                      <Image
                        src={images[selected].url}
                        alt={images[selected].alt_text ?? title}
                        fill
                        className="object-contain"
                        sizes="95vw"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              {hasMultiple && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 sm:p-3 transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 sm:p-3 transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom bar: counter + thumbnails */}
            {hasMultiple && (
              <div
                className="p-3 flex flex-col items-center gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Counter */}
                <span className="text-white/70 text-sm font-medium">
                  {selected + 1} / {images.length}
                </span>

                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
                  {images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => goTo(index, index > selected ? 1 : -1)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selected === index
                          ? 'border-orange-500 opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      {img.url && (
                        <Image
                          src={img.url}
                          alt={img.alt_text ?? `${title} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
