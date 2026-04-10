'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SpecItem { key: string; value: string }
interface SpecGroup { label: string; sort_order?: number; items: SpecItem[] }
interface Modification { name: string; groups: SpecGroup[] }
interface SpecsData { modifications?: Modification[] }
interface Props {
  specs: SpecsData | SpecGroup[] | null;
  t: { catalog: { specs: string; noSpecs: string } };
}

export default function SpecsViewer({ specs, t }: Props) {
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!specs) return <p className="text-gray-400 py-8">{t.catalog.noSpecs}</p>;

  let mods: Modification[];
  if ('modifications' in specs && Array.isArray(specs.modifications)) {
    mods = specs.modifications;
  } else if (Array.isArray(specs)) {
    mods = [{ name: '', groups: specs }];
  } else {
    return <p className="text-gray-400 py-8">{t.catalog.noSpecs}</p>;
  }
  if (!mods.length) return null;

  const cur = mods[sel];
  const multi = mods.length > 1;

  return (
    <section>
      {/* Header + Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t.catalog.specs}</h2>
      </div>

      {multi && (
        <div className="relative mb-5" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="w-full sm:w-auto sm:min-w-[360px] flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-left cursor-pointer hover:border-gray-300 transition-colors duration-100"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-none">Modifikasiya</span>
              <span className="text-[13px] font-semibold text-gray-900 block truncate mt-0.5">{cur.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute top-full left-0 sm:w-[420px] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/10 z-30 max-h-[50vh] overflow-y-auto">
              {mods.map((m, i) => (
                <button
                  key={i}
                  onClick={() => { setSel(i); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[13px] flex items-center gap-2 cursor-pointer transition-colors duration-75 ${
                    i === sel ? 'bg-orange-50 text-orange-600 font-medium' : 'hover:bg-gray-50 text-gray-700'
                  } ${i < mods.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <span className="w-4 flex-shrink-0">
                    {i === sel && <Check className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />}
                  </span>
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Spec groups — compact 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cur.groups.map((g, gi) => (
          <div key={gi} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{g.label}</h3>
            </div>
            <div>
              {g.items?.map((item, ii) => (
                <div
                  key={ii}
                  className={`flex justify-between px-4 py-1.5 text-[13px] leading-snug ${
                    ii % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <span className="text-gray-500 pr-3">{item.key}</span>
                  <span className="font-medium text-gray-900 text-right whitespace-nowrap">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
