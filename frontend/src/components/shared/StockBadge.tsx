import type { StockStatus } from '@/types';
import type { Translations } from '@/i18n/az';

interface StockBadgeProps {
  status: StockStatus;
  t: Translations;
}

const statusConfig: Record<
  StockStatus,
  { label: keyof Translations['product']; className: string }
> = {
  in_stock: { label: 'inStock', className: 'bg-green-100 text-green-700' },
  by_order: { label: 'byOrder', className: 'bg-amber-100 text-amber-700' },
  out_of_stock: { label: 'outOfStock', className: 'bg-gray-100 text-gray-500' },
};

export default function StockBadge({ status, t }: StockBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.out_of_stock;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${config.className}`}
    >
      {t.product[config.label] as string}
    </span>
  );
}
