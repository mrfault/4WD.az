import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
  keywords: ['offroad', '4wd', 'aksessuarlar', 'tuning', 'azerbaijan', 'araba'],
  openGraph: {
    title: '4WD.az - Offroad Aksessuarları',
    description: 'Azərbaycanda offroad aksessuarları, avtomobil tuning və 4x4 avadanlıqları.',
    locale: 'az_AZ',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
