'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import type { Translations } from '@/i18n/az';
import type { Category, VehicleBrand, VehicleModel, StockStatus, Locale } from '@/types';
import { getVehicleModels } from '@/lib/api';

interface ProductFiltersProps {
  t: Translations;
  locale: Locale;
  categories: Category[];
  brands: VehicleBrand[];
  isMobile?: boolean;
  onClose?: () => void;
}

export default function ProductFilters({
  t,
  locale,
  categories,
  brands,
  isMobile = false,
  onClose,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get('category') ?? '',
    brand: searchParams.get('brand') ?? '',
    model: searchParams.get('model') ?? '',
    min_price: searchParams.get('min_price') ?? '',
    max_price: searchParams.get('max_price') ?? '',
    stock_status: (searchParams.get('stock_status') as StockStatus | '') ?? '',
    is_hot_sale: searchParams.get('is_hot_sale') === 'true',
    is_discounted: searchParams.get('is_discounted') === 'true',
  });

  const [models, setModels] = useState<VehicleModel[]>([]);

  useEffect(() => {
    if (!localFilters.brand) {
      setModels([]);
      return;
    }
    getVehicleModels(locale, localFilters.brand)
      .then(setModels)
      .catch(() => setModels([]));
  }, [localFilters.brand, locale]);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    const keys = ['category', 'brand', 'model', 'min_price', 'max_price', 'stock_status'] as const;
    keys.forEach((key) => {
      if (localFilters[key]) {
        params.set(key, localFilters[key] as string);
      } else {
        params.delete(key);
      }
    });
    if (localFilters.is_hot_sale) {
      params.set('is_hot_sale', 'true');
    } else {
      params.delete('is_hot_sale');
    }
    if (localFilters.is_discounted) {
      params.set('is_discounted', 'true');
    } else {
      params.delete('is_discounted');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
    onClose?.();
  }

  function clearFilters() {
    setLocalFilters({
      category: '',
      brand: '',
      model: '',
      min_price: '',
      max_price: '',
      stock_status: '',
      is_hot_sale: false,
      is_discounted: false,
    });
    router.push(pathname);
    onClose?.();
  }

  const hasActiveFilters = Object.entries(localFilters).some(([, v]) =>
    typeof v === 'boolean' ? v : v !== ''
  );

  const content = (
    <div className="space-y-5">
      {/* Category */}
      <FilterGroup label={t.product.category}>
        <select
          value={localFilters.category}
          onChange={(e) => setLocalFilters((f) => ({ ...f, category: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors appearance-none"
        >
          <option value="">{t.product.allCategories}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {locale === 'az' ? cat.name_az || cat.name : cat.name_en || cat.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      {/* Brand */}
      <FilterGroup label={t.product.brand}>
        <select
          value={localFilters.brand}
          onChange={(e) =>
            setLocalFilters((f) => ({ ...f, brand: e.target.value, model: '' }))
          }
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors appearance-none"
        >
          <option value="">{t.product.allBrands}</option>
          {brands.map((b) => (
            <option key={b.id} value={(b as any).slug ?? b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      {/* Model (dependent) */}
      {models.length > 0 && (
        <FilterGroup label={t.product.model}>
          <select
            value={localFilters.model}
            onChange={(e) => setLocalFilters((f) => ({ ...f, model: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors appearance-none"
          >
            <option value="">{t.product.allModels}</option>
            {models.map((m) => (
              <option key={m.id} value={(m as any).slug ?? m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </FilterGroup>
      )}

      {/* Price range */}
      <FilterGroup label={t.product.price}>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder={t.product.minPrice}
            value={localFilters.min_price}
            onChange={(e) => setLocalFilters((f) => ({ ...f, min_price: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
          />
          <input
            type="number"
            min={0}
            placeholder={t.product.maxPrice}
            value={localFilters.max_price}
            onChange={(e) => setLocalFilters((f) => ({ ...f, max_price: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
          />
        </div>
      </FilterGroup>

      {/* Stock status */}
      <FilterGroup label={t.product.stockStatus}>
        <select
          value={localFilters.stock_status}
          onChange={(e) =>
            setLocalFilters((f) => ({
              ...f,
              stock_status: e.target.value as StockStatus | '',
            }))
          }
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors appearance-none"
        >
          <option value="">{t.product.allStatuses}</option>
          <option value="in_stock">{t.product.inStock}</option>
          <option value="by_order">{t.product.byOrder}</option>
        </select>
      </FilterGroup>

      {/* Checkboxes */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={localFilters.is_hot_sale}
            onChange={(e) =>
              setLocalFilters((f) => ({ ...f, is_hot_sale: e.target.checked }))
            }
            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">{t.product.hotSaleFilter}</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={localFilters.is_discounted}
            onChange={(e) =>
              setLocalFilters((f) => ({ ...f, is_discounted: e.target.checked }))
            }
            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">{t.product.discountedFilter}</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={applyFilters}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
        >
          {t.product.apply}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {t.product.clear}
          </button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
        <div
          className="w-80 max-w-full h-full bg-white overflow-y-auto shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <SlidersHorizontal className="w-4 h-4" />
              {t.product.filters}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label={t.common.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-full">
      <div className="flex items-center gap-2 font-bold text-gray-900 mb-5">
        <SlidersHorizontal className="w-4 h-4" />
        {t.product.filters}
        {hasActiveFilters && (
          <span className="ml-auto text-xs text-orange-500 font-semibold">{t.product.clear}</span>
        )}
      </div>
      {content}
    </aside>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && children}
    </div>
  );
}
