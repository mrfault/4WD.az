'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BentoItem {
  id: number;
  title: string;
  image: string;
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
  // Auto pattern for unspecified items
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
          return (
            <motion.div
              key={item.id}
              className={`relative overflow-hidden rounded-xl cursor-pointer group ${spanClass}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelected(item)}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
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

      {/* Lightbox */}
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
              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={selected.image}
                  alt={selected.title}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
              {(selected.title || selected.description) && (
                <div className="p-4 bg-gray-900 text-white">
                  <h3 className="font-semibold text-lg">{selected.title}</h3>
                  {selected.description && (
                    <p className="text-gray-400 text-sm mt-1">{selected.description}</p>
                  )}
                </div>
              )}
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
