import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  price: string | number;
  oldPrice?: string | number | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { current: 'text-base font-bold', old: 'text-sm' },
  md: { current: 'text-xl font-bold', old: 'text-sm' },
  lg: { current: 'text-2xl font-bold', old: 'text-base' },
};

export default function PriceDisplay({ price, oldPrice, size = 'md' }: PriceDisplayProps) {
  const classes = sizeClasses[size];
  const hasDiscount =
    oldPrice !== null &&
    oldPrice !== undefined &&
    parseFloat(String(oldPrice)) > parseFloat(String(price));

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`${classes.current} text-orange-500`}>{formatPrice(price)}</span>
      {hasDiscount && (
        <span className={`${classes.old} text-gray-400 line-through`}>
          {formatPrice(oldPrice!)}
        </span>
      )}
    </div>
  );
}
