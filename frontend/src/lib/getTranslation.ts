import az from '@/i18n/az';
import en from '@/i18n/en';
import type { Locale } from '@/types';
import type { Translations } from '@/i18n/az';

const dictionaries: Record<Locale, Translations> = { az, en };

/**
 * Server-safe translation function. Use this in Server Components.
 */
export function getTranslation(locale: Locale): Translations {
  return dictionaries[locale] ?? az;
}
