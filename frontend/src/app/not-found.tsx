import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-black text-orange-500 mb-4">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Səhifə tapılmadı
        </h1>
        <p className="text-gray-500 mb-8">
          Axtardığınız səhifə mövcud deyil və ya köçürülüb.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors w-full sm:w-auto"
          >
            Ana Səhifə
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-orange-300 hover:text-orange-600 transition-colors w-full sm:w-auto"
          >
            Məhsullar
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-orange-300 hover:text-orange-600 transition-colors w-full sm:w-auto"
          >
            Əlaqə
          </Link>
        </div>
      </div>
    </div>
  );
}
