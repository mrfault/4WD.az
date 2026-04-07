import type { Metadata } from 'next';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getSettings } from '@/lib/api';
import ContactPageClient from './_client';

interface ContactPageProps {
  params: Promise<{}>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  return {
    title: 'Əlaqə',
    description: 'Bizimlə əlaqə saxlayın. 4WD.az - Azərbaycanda offroad aksessuarları və 4x4 avadanlıqları mağazası. Sifariş və məsləhət üçün müraciət edin.',
    alternates: { canonical: 'https://4wd.az/contact' },
    openGraph: {
      title: 'Əlaqə | 4WD.az',
      description: 'Bizimlə əlaqə saxlayın. Sifariş və məsləhət üçün müraciət edin.',
      url: 'https://4wd.az/contact',
      type: 'website',
      siteName: '4WD.az',
    },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  
  
  const t = getTranslation();

  let settings = null;
  try {
    settings = await getSettings('az');
  } catch {
    // settings remain null
  }

  return <ContactPageClient t={t} locale={'az'} settings={settings} />;
}
