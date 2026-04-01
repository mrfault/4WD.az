import type { Metadata } from 'next';
import type { Locale } from '@/types';
import { getTranslation } from '@/lib/getTranslation';
import { getSettings } from '@/lib/api';
import ContactPageClient from './_client';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslation(locale as Locale);
  return { title: t.contact.title };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const safeLocale = locale as Locale;
  const t = getTranslation(safeLocale);

  let settings = null;
  try {
    settings = await getSettings(safeLocale);
  } catch {
    // settings remain null
  }

  return <ContactPageClient t={t} locale={safeLocale} settings={settings} />;
}
