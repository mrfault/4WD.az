import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getTranslation } from '@/lib/getTranslation';
import { getCategories, getSettings } from '@/lib/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import JsonLd from '@/components/shared/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#f97316',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://4wd.az'),
  title: {
    default: '4WD.az - Offroad Aksessuarları',
    template: '%s | 4WD.az',
  },
  description:
    'Azərbaycanda offroad aksessuarları, avtomobil tuning və 4x4 avadanlıqları üzrə lider mağaza.',
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
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: '4WD.az',
            url: 'https://4wd.az',
            logo: 'https://4wd.az/logo.png',
            sameAs: [
              sett?.facebook_url,
              sett?.instagram_url,
              sett?.youtube_url,
            ].filter(Boolean),
          }}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: '4WD.az',
            url: 'https://4wd.az',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://4wd.az/products?search={search_term}',
              'query-input': 'required name=search_term',
            },
          }}
        />
        <Header locale={locale} categories={cats} settings={sett} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} t={t} categories={cats} settings={sett} />
        {sett?.whatsapp_number && <WhatsAppButton phone={sett.whatsapp_number} />}
      </body>
    </html>
  );
}
