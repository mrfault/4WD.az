'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';
import type { Locale, LeadFormData, Settings } from '@/types';
import type { Translations } from '@/i18n/az';
import { createLead } from '@/lib/api';

interface ContactPageClientProps {
  t: Translations;
  locale: Locale;
  settings: Settings | null;
}

interface FormState {
  name: string;
  phone: string;
  message: string;
}

interface FormErrors {
  phone?: string;
}

export default function ContactPageClient({ t, locale, settings }: ContactPageClientProps) {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.phone.trim()) {
      newErrors.phone = t.lead.phoneRequired;
    } else if (!/^[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = t.lead.phoneHint;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: LeadFormData = {
        customer_name: form.name.trim() || undefined,
        phone: `+994${form.phone.replace(/\s/g, '')}`,
        message: form.message.trim() || undefined,
        source: 'contact',
      };
      await createLead(payload);
      setSuccess(true);
      setForm({ name: '', phone: '', message: '' });
    } catch {
      setErrors({ phone: t.common.error });
    } finally {
      setLoading(false);
    }
  }

  const phone = settings?.contact_phone ?? null;
  const email = settings?.contact_email ?? null;
  const address =
    'az' === 'az'
      ? settings?.address_az
      : settings?.address_en;
  const workingHours =
    'az' === 'az'
      ? settings?.working_hours_az
      : settings?.working_hours_en;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-gray-900">{t.contact.title}</h1>
        <p className="text-gray-500 mt-3 text-lg">{t.contact.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t.contact.formTitle}</h2>

          {success ? (
            <div className="flex flex-col items-center text-center py-10 gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t.lead.success}</h3>
                <p className="text-gray-500 mt-1">{t.lead.successMessage}</p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 bg-orange-500 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                {t.common.close}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.lead.name}
                </label>
                <input
                  type="text"
                  placeholder={t.lead.namePlaceholder}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.lead.phone} <span className="text-red-500">*</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm font-medium select-none">
                    <Phone className="w-4 h-4 text-gray-400" />
                    +994
                  </span>
                  <input
                    type="tel"
                    placeholder="50 000 00 00"
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9\s]/g, '');
                      setForm((f) => ({ ...f, phone: val }));
                      if (errors.phone) setErrors({});
                    }}
                    className={`w-full px-4 py-3 rounded-r-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                <p className="mt-1 text-xs text-gray-400">{t.lead.phoneHint}</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.lead.message}
                </label>
                <textarea
                  rows={5}
                  placeholder={t.lead.messagePlaceholder}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold text-base hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    {t.lead.submitting}
                  </>
                ) : (
                  t.contact.sendMessage
                )}
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-8">
          {/* Info card */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t.contact.title}</h2>
            <ul className="space-y-5">
              {phone && (
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      {t.contact.phone}
                    </p>
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="text-gray-900 font-semibold hover:text-orange-500 transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </li>
              )}

              {email && (
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      {t.contact.email}
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="text-gray-900 font-semibold hover:text-orange-500 transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </li>
              )}

              {address && (
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      {t.contact.address}
                    </p>
                    <p className="text-gray-900 font-semibold">{address}</p>
                  </div>
                </li>
              )}

              {workingHours && (
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      {t.contact.workingHours}
                    </p>
                    <p className="text-gray-900 font-semibold">{workingHours}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Social media */}
          {(settings?.instagram_url || settings?.facebook_url || settings?.youtube_url) && (
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-base font-bold text-gray-900 mb-4">{t.contact.followUs}</h3>
              <div className="flex gap-3">
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                )}
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}
                {settings.youtube_url && (
                  <a
                    href={settings.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                    aria-label="YouTube"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* WhatsApp */}
          {settings?.whatsapp_number && (
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-5 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-colors font-bold"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              WhatsApp
            </a>
          )}

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 h-64">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(address || 'Baku, Azerbaijan')}&zoom=15`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t.contact.mapTitle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
