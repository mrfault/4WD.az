'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { X, ChevronRight } from 'lucide-react';
import type { Translations } from '@/i18n/az';
import type { Locale, Category } from '@/types';
import LanguageSwitcher from './LanguageSwitcher';

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  categories: Category[];
  t: Translations;
  locale: Locale;
}

export default function MobileMenu({
  open,
  onClose,
  navItems,
  categories,
  t,
  locale,
}: MobileMenuProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-xs">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <span className="text-xl font-black">
                        4<span className="text-orange-500">WD</span>.az
                      </span>
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close menu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center justify-between px-3 py-3 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          {item.label}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      ))}

                      {/* Categories */}
                      {categories.length > 0 && (
                        <div className="pt-4">
                          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {t.nav.categories}
                          </p>
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/${locale}/categories/${cat.slug}`}
                              onClick={onClose}
                              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            >
                              {locale === 'az' ? cat.name_az || cat.name : cat.name_en || cat.name}
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </nav>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-gray-100">
                      <LanguageSwitcher locale={locale} />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
