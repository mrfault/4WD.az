'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Locale } from '@/types';
import type { Translations } from '@/i18n/az';
import LeadFormModal from '@/components/lead/LeadFormModal';

interface ProductDetailCTAProps {
  t: Translations;
  locale: Locale;
  productId: number;
  productTitle: string;
}

export default function ProductDetailCTA({
  t,
  locale,
  productId,
  productTitle,
}: ProductDetailCTAProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors shadow-lg shadow-orange-500/30"
      >
        <ShoppingCart className="w-6 h-6" />
        {t.product.getIt}
      </button>

      <LeadFormModal
        open={open}
        onClose={() => setOpen(false)}
        t={t}
        locale={locale}
        productId={productId}
        productTitle={productTitle}
        source="product"
      />
    </>
  );
}
