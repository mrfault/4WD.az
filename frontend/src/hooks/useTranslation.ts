'use client';

import { useMemo } from 'react';
import az from '@/i18n/az';
import type { Translations } from '@/i18n/az';

export function useTranslation() {
  const t = useMemo(() => az, []);
  return { t, locale: 'az' as const };
}
