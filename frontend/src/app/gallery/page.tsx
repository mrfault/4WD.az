import type { Metadata } from 'next';
import GalleryPageClient from './_client';

export const metadata: Metadata = {
  title: 'Qalereya',
  description: 'Offroad tuning dünyasından ilham verici fotolar. 4x4 avtomobillər üçün aksessuarlar və tuning işləri.',
  alternates: { canonical: 'https://4wd.az/gallery' },
  openGraph: {
    title: 'Qalereya | 4WD.az',
    description: 'Offroad tuning dünyasından ilham verici fotolar.',
    url: 'https://4wd.az/gallery',
    type: 'website',
    siteName: '4WD.az',
  },
};

export default function GalleryPage() {
  return <GalleryPageClient />;
}
