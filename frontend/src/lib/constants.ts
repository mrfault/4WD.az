export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000';

export const SUPPORTED_LOCALES = ['az'] as const;
export const DEFAULT_LOCALE = 'az';

export const ITEMS_PER_PAGE = 12;

export const ORANGE = '#f97316';
export const DARK_BG = '#1a1a1a';
