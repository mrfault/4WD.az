import type { Translations } from '@/i18n/az';

interface DiscountBadgeProps {
  percent: number;
  t: Translations;
}

export default function DiscountBadge({ percent, t }: DiscountBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-bold">
      -{percent}% {t.product.discount}
    </span>
  );
}
