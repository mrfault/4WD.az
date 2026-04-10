import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/getTranslation';
import { getCatalogGenerationDetail } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { CatalogGenerationDetail } from '@/types';
import SpecsViewer from './SpecsViewer';
import ImageSlider from './ImageSlider';

interface Props {
  params: Promise<{ brandSlug: string; genSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genSlug } = await params;
  try {
    const gen = await getCatalogGenerationDetail(genSlug, 'az');
    return {
      title: `${gen.brand.name} ${gen.model.name} ${gen.name} — Texniki Xüsusiyyətlər | 4WD.az`,
      description: `${gen.brand.name} ${gen.model.name} ${gen.name} (${gen.year_from}${gen.year_to ? '-' + gen.year_to : '+'}) texniki göstəriciləri.`,
    };
  } catch {
    return { title: '4x4 Kataloq | 4WD.az' };
  }
}

export default async function GenerationDetailPage({ params }: Props) {
  const { brandSlug, genSlug } = await params;
  const t = getTranslation();

  let gen: CatalogGenerationDetail | null = null;
  try {
    gen = await getCatalogGenerationDetail(genSlug, 'az');
  } catch {
    notFound();
  }
  if (!gen) notFound();

  const heroUrl = getImageUrl(gen.image);
  const yearTo = gen.year_to ?? t.catalog.present;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-orange-500 transition-colors">{t.nav.home}</Link>
        <span>/</span>
        <Link href="/4x4-catalog" className="hover:text-orange-500 transition-colors">{t.catalog.title}</Link>
        <span>/</span>
        <Link href={`/4x4-catalog/${brandSlug}`} className="hover:text-orange-500 transition-colors">{gen.brand.name}</Link>
        <span>/</span>
        <span className="text-gray-600 font-medium">{gen.model.name} {gen.name}</span>
      </nav>

      {/* Image Slider */}
      <ImageSlider
        images={gen.gallery?.length ? gen.gallery : (heroUrl ? [heroUrl] : [])}
        alt={`${gen.brand.name} ${gen.model.name} ${gen.name}`}
      />

      {/* Title — compact */}
      <div className="flex items-center gap-3 mb-1">
        {gen.brand.logo && (
          <Image src={getImageUrl(gen.brand.logo)!} alt={gen.brand.name} width={28} height={28} className="object-contain" />
        )}
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
          {gen.brand.name} {gen.model.name} {gen.name}
        </h1>
      </div>
      <p className="text-orange-500 font-bold mb-8">{gen.year_from} – {yearTo}</p>

      {/* Specs */}
      <SpecsViewer specs={gen.specs} t={t} />

      {/* Back */}
      <div className="pt-5 mt-8 border-t border-gray-100">
        <Link
          href={`/4x4-catalog/${brandSlug}`}
          className="text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors"
        >
          &larr; {gen.brand.name} modellərə qayıt
        </Link>
      </div>
    </div>
  );
}
