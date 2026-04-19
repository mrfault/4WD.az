'use client';

import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/constants';

interface ViewTrackerProps {
  slug: string;
  type: 'blog' | 'product';
}

export default function ViewTracker({ slug, type }: ViewTrackerProps) {
  useEffect(() => {
    const key = `viewed_${type}_${slug}`;

    // Only count if not already viewed in this session
    if (sessionStorage.getItem(key)) return;

    // Only count if user came from our site (not direct/refresh)
    const referrer = document.referrer;
    if (!referrer || !referrer.includes(window.location.hostname)) return;

    sessionStorage.setItem(key, '1');
    fetch(`${API_BASE_URL}/${type === 'blog' ? 'blog' : 'products'}/${slug}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }, [slug, type]);

  return null;
}
