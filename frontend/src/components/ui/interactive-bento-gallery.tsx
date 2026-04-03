'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BentoItem {
  id: number;
  title: string;
  image: string;
  images?: string[];
  description?: string | null;
  span?: 'small' | 'medium' | 'large';
}

interface InteractiveBentoGalleryProps {
  items: BentoItem[];
  title?: string;
  subtitle?: string;
}

function getSpanClasses(span: BentoItem['span'], index: number): string {
  if (span === 'large') return 'col-span-2 row-span-2';
  if (span === 'medium') return 'col-span-2 row-span-1 md:col-span-1 md:row-span-2';
  if (index === 0) return 'col-span-2 row-span-2';
  if (index === 3) return 'col-span-2 row-span-1';
  return 'col-span-1 row-span-1';
}

export default function InteractiveBentoGallery({
  items,
  title,
  subtitle,
}: InteractiveBentoGalleryProps) {
  const [selected, setSelected] = useState<BentoItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  function openItem(item: BentoItem) {
    setSelected(item);
    setCurrentImageIndex(0);
  }

  function getAllImages(item: BentoItem): string[] {
    if (item.images && item.images.length > 0) return item.images;
    return [item.image];
  }

  function prevImage() {
    if (!selected) return;
    const imgs = getAllImages(selected);
    setCurrentImageIndex((i) => (i - 1 + imgs.length) % imgs.length);
  }

  function nextImage() {
    if (!selected) return;
    const imgs = getAllImages(selected);
    setCurrentImageIndex((i) => (i + 1) % imgs.length);
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
          {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
        {items.map((item, index) => {
          const spanClass = getSpanClasses(item.span, index);
          const photoCount = getAllImages(item).length;
          return (
            <motion.div
              key={item.id}
              className={`relative overflow-hidden rounded-xl cursor-pointer group ${spanClass}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => openItem(item)}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={index < 4}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                <div className="p-4 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-semibold text-sm leading-tight">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-white/80 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
              {/* Photo count badge */}
              {photoCount > 1 && (
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-lg">
                  {photoCount} foto
                </div>
              )}
              {/* Zoom icon */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox with multi-image slider */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative max-w-4xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main image */}
              <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={getAllImages(selected)[currentImageIndex]}
                      alt={`${selected.title} ${currentImageIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="90vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Nav arrows */}
                {getAllImages(selected).length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Counter */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {getAllImages(selected).length}
                    </div>
                  </>
                )}
              </div>

              {/* Info */}
              {(selected.title || selected.description) && (
                <div className="p-4 bg-gray-900 text-white">
                  <h3 className="font-semibold text-lg">{selected.title}</h3>
                  {selected.description && (
                    <p className="text-gray-400 text-sm mt-1">{selected.description}</p>
                  )}
                </div>
              )}

              {/* Thumbnails */}
              {getAllImages(selected).length > 1 && (
                <div className="px-4 pb-4 bg-gray-900 flex gap-2 overflow-x-auto">
                  {getAllImages(selected).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        i === currentImageIndex ? 'border-orange-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}

              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
