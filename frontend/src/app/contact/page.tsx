import type { Metadata } from 'next';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getSettings } from '@/lib/api';
import ContactPageClient from './_client';

interface ContactPageProps {
  params: Promise<{}>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  
  const t = getTranslation();
  return { title: t.contact.title };
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
