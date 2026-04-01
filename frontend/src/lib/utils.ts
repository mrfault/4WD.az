import { STORAGE_BASE_URL } from './constants';
import type { Locale } from '@/types';

/**
 * Prefix a relative image path with the storage base URL.
 * If path is already absolute (starts with http), return as-is.
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${STORAGE_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Format a price value as AZN currency string.
 */
export function formatPrice(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return `${num.toFixed(2)} ₼`;
}

/**
 * Get localised field from an object that has _az / _en suffixed fields.
 * Falls back to base field name then empty string.
 */
export function getLocalField(
  obj: Record<string, unknown>,
  field: string,
  locale: Locale
): string {
  const localised = obj[`${field}_${locale}`];
  if (typeof localised === 'string' && localised.trim() !== '') return localised;
  const base = obj[field];
  if (typeof base === 'string') return base;
  return '';
}

/**
 * Build a URL with query params, omitting undefined/null/empty values.
 */
export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const url = new URL(base, 'http://placeholder');
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.set(key, String(val));
    }
  }
  return url.pathname + (url.search ? url.search : '');
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format an ISO date string to a human-readable date.
 */
export function formatDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(locale === 'az' ? 'az-AZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Truncate text to a given length with ellipsis.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
}

/**
 * Merge class names (simple implementation without external dep).
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
