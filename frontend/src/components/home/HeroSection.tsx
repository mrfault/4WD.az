'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, PhoneCall } from 'lucide-react';
import type { Locale } from '@/types';
import type { Translations } from '@/i18n/az';

interface HeroSectionProps {
  t: Translations;
  locale: Locale;
}

export default function HeroSection({ t, locale }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gray-950 min-h-[80vh] flex items-center">
      {/* Background gradient + geometric shapes */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800" />
        {/* Orange accent blob */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />

        {/* Diagonal stripes (decorative) */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-px bg-white"
              style={{
                left: `${(i + 1) * 12.5}%`,
                transform: 'skewX(-20deg)',
              }}
            />
          ))}
        </div>

        {/* Bottom angled shape */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 bg-white"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 40%, 0 100%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            {t.hero.badge}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight"
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
            className="mt-6 text-gray-300 text-lg leading-relaxed max-w-xl"
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
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-base"
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
                <div className="text-2xl font-black text-orange-400">{stat.value}</div>
                <div className="text-gray-400 text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
