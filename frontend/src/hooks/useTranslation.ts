'use client';

import { useMemo } from 'react';
import az from '@/i18n/az';
import en from '@/i18n/en';
import type { Locale } from '@/types';
import type { Translations } from '@/i18n/az';

const dictionaries: Record<Locale, Translations> = { az, en };

export function useTranslation(locale: Locale) {
  const t = useMemo(() => dictionaries[locale] ?? az, [locale]);
  return { t, locale };
}
