import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getTranslation } from '@/lib/getTranslation';
import { getCategories, getSettings } from '@/lib/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '4WD.az - Offroad Aksessuarları',
    template: '%s | 4WD.az',
  },
  description:
    'Azərbaycanda offroad aksessuarları, avtomobil tuning və 4x4 avadanlıqları üzrə lider mağaza.',
  keywords: ['offroad', '4wd', 'aksessuarlar', 'tuning', 'azerbaijan'],
  openGraph: {
    title: '4WD.az - Offroad Aksessuarları',
    description: 'Azərbaycanda offroad aksessuarları, avtomobil tuning və 4x4 avadanlıqları.',
    locale: 'az_AZ',
    type: 'website',
    url: 'https://4wd.az',
    siteName: '4WD.az',
    images: [
      {
        url: 'https://4wd.az/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '4WD.az - Offroad Aksessuarları',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '4WD.az - Offroad Aksessuarları',
    description: 'Azərbaycanda offroad aksessuarları, avtomobil tuning və 4x4 avadanlıqları.',
    images: ['https://4wd.az/og-image.jpg'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = getTranslation();
  const locale = 'az';

  const [categories, settings] = await Promise.allSettled([
    getCategories(locale),
    getSettings(locale),
  ]);

  const cats = categories.status === 'fulfilled' ? categories.value : [];
  const sett = settings.status === 'fulfilled' ? settings.value : null;

  return (
    <html lang="az" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header locale={locale} categories={cats} settings={sett} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} t={t} categories={cats} settings={sett} />
      </body>
    </html>
  );
}
