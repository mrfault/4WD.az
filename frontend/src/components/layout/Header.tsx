'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ChevronDown, Phone } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import MobileMenu from './MobileMenu';
import type { Locale, Category, Settings } from '@/types';

interface HeaderProps {
  locale: Locale;
  categories?: Category[];
  settings?: Settings | null;
}

export default function Header({ locale, categories = [], settings }: HeaderProps) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: t.nav.home, href: `/` },
    { label: t.nav.products, href: `/products` },
    { label: t.nav.gallery, href: `/gallery` },
    { label: t.nav.blog, href: `/blog` },
    { label: t.nav.contact, href: `/contact` },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={`/`}
              className="flex-shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="4WD.az"
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              {/* Categories dropdown */}
              {categories.length > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => setCategoriesOpen(true)}
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                    {t.nav.categories}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        categoriesOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {categoriesOpen && (
                    <div className="absolute top-full left-0 pt-0 w-56 z-50">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-1 max-h-[70vh] overflow-y-auto">
                        <Link
                          href={`/products`}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium"
                        >
                          {t.nav.allProducts}
                        </Link>
                        <div className="my-1 border-t border-gray-100" />
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/categories/${cat.slug}`}
                            className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            {locale === 'az' ? cat.name_az || cat.name : cat.name_en || cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Phone */}
              {settings?.contact_phone && (
                <a
                  href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}
                  className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{settings.contact_phone}</span>
                </a>
              )}

              {/* Hamburger (mobile) */}
              <button
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        categories={categories}
        t={t}
        locale={locale}
        settings={settings}
      />
    </>
  );
}
