import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/getTranslation';
import { getCategories, getSettings } from '@/lib/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Locale } from '@/types';
import { SUPPORTED_LOCALES } from '@/lib/constants';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslation(locale as Locale);
  return {
    title: {
      default: '4WD.az',
      template: '%s | 4WD.az',
    },
    description:
      locale === 'az'
        ? 'Azərbaycanda offroad aksessuarları, avtomobil tuning.'
        : 'Offroad accessories and tuning in Azerbaijan.',
    alternates: {
      languages: {
        az: '/az',
        en: '/en',
      },
    },
  };
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const safeLocale = locale as Locale;
  const t = getTranslation(safeLocale);

  const [categories, settings] = await Promise.allSettled([
    getCategories(safeLocale),
    getSettings(safeLocale),
  ]);

  const cats = categories.status === 'fulfilled' ? categories.value : [];
  const sett = settings.status === 'fulfilled' ? settings.value : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={safeLocale} categories={cats} />
      <main className="flex-1">{children}</main>
      <Footer locale={safeLocale} t={t} categories={cats} settings={sett} />
    </div>
  );
}
