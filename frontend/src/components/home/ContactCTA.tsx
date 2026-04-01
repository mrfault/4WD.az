'use client';

import { useState } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import type { Locale } from '@/types';
import type { Translations } from '@/i18n/az';
import LeadFormModal from '@/components/lead/LeadFormModal';

interface ContactCTAProps {
  t: Translations;
  locale: Locale;
  phone?: string | null;
}

export default function ContactCTA({ t, locale, phone }: ContactCTAProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="py-16 bg-gray-900 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{t.home.contactCTA}</h2>
          <p className="text-gray-400 text-lg mb-10">{t.home.contactCTASubtitle}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${(phone ?? '+994501234567').replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base shadow-lg shadow-orange-500/20"
            >
              <Phone className="w-5 h-5" />
              {phone ?? '+994 50 123 45 67'}
            </a>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base"
            >
              <MessageSquare className="w-5 h-5" />
              {t.lead.titleGeneral}
            </button>
          </div>
        </div>
      </section>

      <LeadFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        t={t}
        locale={locale}
        source="general"
      />
    </>
  );
}
