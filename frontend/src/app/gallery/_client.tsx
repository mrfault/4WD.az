'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES_PER_PAGE = 24;

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  brand: string;
  span: 'small' | 'medium' | 'large';
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80',
    alt: 'Jeep Wrangler Offroad',
    brand: 'Jeep',
    span: 'large',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1741905358583-1999b08d6e2e?w=800&q=80',
    alt: 'Land Rover Defender Modified',
    brand: 'Land Rover',
    span: 'small',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1576676825635-472f74a821ec?w=800&q=80',
    alt: 'Toyota Land Cruiser Səhra',
    brand: 'Toyota',
    span: 'small',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1640020601421-560fbfbbdae8?w=800&q=80',
    alt: 'Ford F-150 Raptor',
    brand: 'Ford',
    span: 'medium',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1619226796274-9f0adda6d5aa?w=800&q=80',
    alt: 'Jeep Wrangler Torpaq Yolda',
    brand: 'Jeep',
    span: 'small',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1557777936-fa63dbfd01ef?w=800&q=80',
    alt: 'Land Rover Defender Səhrada',
    brand: 'Land Rover',
    span: 'small',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1572629166063-011a332eafed?w=800&q=80',
    alt: 'Toyota Land Cruiser Qızıl Saat',
    brand: 'Toyota',
    span: 'small',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1579097647275-16b002cced9e?w=800&q=80',
    alt: 'Jeep Wrangler JK Tuning',
    brand: 'Jeep',
    span: 'large',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1588129582944-e2e5297b854a?w=800&q=80',
    alt: 'Toyota Land Cruiser Dubai',
    brand: 'Toyota',
    span: 'small',
  },
  {
    id: 10,
    src: 'https://images.unsplash.com/photo-1627666259356-03a116b7dde9?w=800&q=80',
    alt: 'Jeep Wrangler Gün Batımı',
    brand: 'Jeep',
    span: 'small',
  },
  {
    id: 11,
    src: 'https://images.unsplash.com/photo-1714859817907-210d1c922eea?w=800&q=80',
    alt: 'Ford Raptor Offroad',
    brand: 'Ford',
    span: 'medium',
  },
  {
    id: 12,
    src: 'https://images.unsplash.com/photo-1763453646604-59f7295162ef?w=800&q=80',
    alt: 'Land Rover Vintage Səhra',
    brand: 'Land Rover',
    span: 'small',
  },
  {
    id: 13,
    src: 'https://images.unsplash.com/photo-1759428975028-fb239f944d92?w=800&q=80',
    alt: 'Jeep Wrangler Rubicon',
    brand: 'Jeep',
    span: 'small',
  },
  {
    id: 14,
    src: 'https://images.unsplash.com/photo-1578564810934-c131250d3792?w=800&q=80',
    alt: 'Land Rover 4x4',
    brand: 'Land Rover',
    span: 'small',
  },
  {
    id: 15,
    src: 'https://images.unsplash.com/photo-1686715018049-f73970aa97d3?w=800&q=80',
    alt: 'Ford Raptor Səhrada',
    brand: 'Ford',
    span: 'large',
  },
  {
    id: 16,
    src: 'https://images.unsplash.com/photo-1596507814052-d2f51a6adcfb?w=800&q=80',
    alt: 'Jeep Wrangler Meşədə',
    brand: 'Jeep',
    span: 'small',
  },
  {
    id: 17,
    src: 'https://images.unsplash.com/photo-1491422433900-4e19887b7b21?w=800&q=80',
    alt: 'Toyota Land Cruiser 5.7L',
    brand: 'Toyota',
    span: 'small',
  },
  {
    id: 18,
    src: 'https://images.unsplash.com/photo-1484950763426-56b5bf172dbb?w=800&q=80',
    alt: 'Offroad Silüet',
    brand: 'Offroad',
    span: 'medium',
  },
  {
    id: 19,
    src: 'https://images.unsplash.com/photo-1579097647447-aaf512c2d0c8?w=800&q=80',
    alt: 'Jeep Wrangler Rock Crawling',
    brand: 'Jeep',
    span: 'small',
  },
  {
    id: 20,
    src: 'https://images.unsplash.com/photo-1500381369072-1e8259ca5ed4?w=800&q=80',
    alt: 'Toyota Land Cruiser Sahildə',
    brand: 'Toyota',
    span: 'small',
  },
  {
    id: 21,
    src: 'https://images.unsplash.com/photo-1759428858123-9dfd095c9eb5?w=800&q=80',
    alt: 'Jeep Wrangler Rubicon Ağ',
    brand: 'Jeep',
    span: 'small',
  },
  {
    id: 22,
    src: 'https://images.unsplash.com/photo-1670069248043-db9433895793?w=800&q=80',
    alt: 'Ford Bronco Offroad',
    brand: 'Ford',
    span: 'large',
  },
  {
    id: 23,
    src: 'https://images.unsplash.com/photo-1498038116800-4159eb9b2a62?w=800&q=80',
    alt: 'Jeep Safari',
    brand: 'Jeep',
    span: 'small',
  },
  {
    id: 24,
    src: 'https://images.unsplash.com/photo-1612383893030-8170164abfa0?w=800&q=80',
    alt: 'Jeep Wrangler Qayalıqda',
    brand: 'Jeep',
    span: 'small',
  },
  {
    id: 25,
    src: 'https://images.unsplash.com/photo-1711512302274-8aafe96481bb?w=800&q=80',
    alt: 'Ford Raptor Qarajda',
    brand: 'Ford',
    span: 'medium',
  },
];

function getSpanClass(span: GalleryImage['span']): string {
  switch (span) {
    case 'large':
      return 'col-span-2 row-span-2';
    case 'medium':
      return 'col-span-2 row-span-1';
    default:
      return 'col-span-1 row-span-1';
  }
}

export default function GalleryPageClient() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const [visibleCount, setVisibleCount] = useState(IMAGES_PER_PAGE);

  const visibleImages = useMemo(
    () => galleryImages.slice(0, visibleCount),
    [visibleCount],
  );
  const hasMore = visibleCount < galleryImages.length;

  const openImage = (index: number) => {
    setDirection(0);
    setSelectedIndex(index);
  };

  const closeImage = () => setSelectedIndex(null);

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    setDirection(1);
    setSelectedIndex((selectedIndex + 1) % visibleImages.length);
  }, [selectedIndex, visibleImages.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setDirection(-1);
    setSelectedIndex((selectedIndex - 1 + visibleImages.length) % visibleImages.length);
  }, [selectedIndex, visibleImages.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') closeImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, goNext, goPrev]);

  const selected = selectedIndex !== null ? visibleImages[selectedIndex] : null;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900">Qaleriya</h1>
        <p className="text-gray-500 mt-3 text-lg">
          Offroad tuning dünyasından ilham verici fotolar
        </p>
      </div>

      {/* Masonry-like bento grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 auto-rows-[140px] sm:auto-rows-[180px] md:auto-rows-[200px]">
        {visibleImages.map((img, index) => (
          <motion.div
            key={img.id}
            className={`relative overflow-hidden rounded-2xl cursor-pointer group ${getSpanClass(img.span)}`}
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.25 }}
            onClick={() => openImage(index)}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              priority={index < 4}
              loading={index < 4 ? 'eager' : 'lazy'}
            />
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setVisibleCount((c) => Math.min(c + IMAGES_PER_PAGE, galleryImages.length))}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            Daha çox göstər ({galleryImages.length - visibleCount} şəkil)
          </button>
        </div>
      )}

      {/* Lightbox / Slider */}
      <AnimatePresence>
        {selected && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={closeImage}
          >
            {/* Close button */}
            <button
              onClick={closeImage}
              className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-2.5 transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-full">
              {selectedIndex + 1} / {visibleImages.length}
            </div>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-colors"
              aria-label="Əvvəlki"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-colors"
              aria-label="Sonrakı"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main image */}
            <div
              className="relative w-full max-w-5xl mx-auto h-[70vh] sm:h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={selectedIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <Image
                    src={selected.src}
                    alt={selected.alt}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

            </div>

            {/* Thumbnail strip — show nearby thumbnails only */}
            {(() => {
              const THUMB_RADIUS = 6;
              const start = Math.max(0, selectedIndex - THUMB_RADIUS);
              const end = Math.min(visibleImages.length, selectedIndex + THUMB_RADIUS + 1);
              const thumbs = visibleImages.slice(start, end);
              return (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-2 py-2 bg-black/40 backdrop-blur-md rounded-2xl">
                  {thumbs.map((img, ti) => {
                    const realIndex = start + ti;
                    return (
                      <button
                        key={img.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDirection(realIndex > selectedIndex ? 1 : -1);
                          setSelectedIndex(realIndex);
                        }}
                        className={`relative w-12 h-9 sm:w-16 sm:h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          realIndex === selectedIndex
                            ? 'border-orange-500 scale-110'
                            : 'border-transparent opacity-50 hover:opacity-100'
                        }`}
                      >
                        <Image src={img.src} alt="" fill className="object-cover" sizes="64px" />
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
