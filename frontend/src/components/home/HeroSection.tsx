'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, PhoneCall } from 'lucide-react';
import type { Locale } from '@/types';
import type { Translations } from '@/i18n/az';

const TOTAL_FRAMES = 86;
const FPS = 15;
const FRAME_INTERVAL = 1000 / FPS;

interface HeroSectionProps {
  t: Translations;
  locale: Locale;
}

function useVideoFrames() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const [loaded, setLoaded] = useState(false);

  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;

    if (delta >= FRAME_INTERVAL) {
      lastTimeRef.current = timestamp - (delta % FRAME_INTERVAL);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const frame = framesRef.current[frameIndexRef.current];

      if (ctx && canvas && frame?.complete && frame.naturalWidth > 0) {
        canvas.width = frame.naturalWidth;
        canvas.height = frame.naturalHeight;
        ctx.drawImage(frame, 0, 0);
      }

      frameIndexRef.current = (frameIndexRef.current + 1) % TOTAL_FRAMES;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i).padStart(3, '0');
      img.src = `/hero-frames/frame-${num}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= Math.min(10, TOTAL_FRAMES)) {
          setLoaded(true);
        }
      };
      images.push(img);
    }

    framesRef.current = images;

    // Start animation after first frames load
    const startTimeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return { canvasRef, loaded };
}

export default function HeroSection({ t, locale }: HeroSectionProps) {
  const { canvasRef, loaded } = useVideoFrames();

  return (
    <section className="relative overflow-hidden bg-gray-950 min-h-[80vh] flex items-center">
      {/* Video-like background from frames */}
      <div className="absolute inset-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Bottom angled shape */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-white z-10"
        style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 30%, 0 100%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            {t.hero.badge}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-lg"
          >
            {t.hero.title.split(' ').map((word, i) => (
              <span key={i}>
                {i === 0 ? (
                  <span className="text-orange-500">{word}</span>
                ) : (
                  <span> {word}</span>
                )}
              </span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-gray-200 text-lg leading-relaxed max-w-xl drop-shadow"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap gap-4 mt-10"
          >
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-orange-500/30"
            >
              {t.hero.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-base backdrop-blur-sm"
            >
              <PhoneCall className="w-5 h-5" />
              {t.hero.ctaSecondary}
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-8 mt-14"
          >
            {[
              { value: '500+', label: locale === 'az' ? 'Məhsul' : 'Products' },
              { value: '1000+', label: locale === 'az' ? 'Müştəri' : 'Customers' },
              { value: '5+', label: locale === 'az' ? 'İl təcrübə' : 'Years exp.' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-orange-400 drop-shadow">{stat.value}</div>
                <div className="text-gray-300 text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
