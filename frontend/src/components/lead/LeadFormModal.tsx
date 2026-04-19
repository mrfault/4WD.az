'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle, Phone } from 'lucide-react';
import { createLead } from '@/lib/api';
import type { LeadFormData, LeadSource, Locale } from '@/types';
import type { Translations } from '@/i18n/az';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  t: Translations;
  locale: Locale;
  productId?: number | null;
  productTitle?: string | null;
  source?: LeadSource;
}

interface FormState {
  name: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  message?: string;
}

export default function LeadFormModal({
  open,
  onClose,
  t,
  locale,
  productId = null,
  productTitle = null,
  source = 'product',
}: LeadFormModalProps) {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    const digits = form.phone.replace(/\s/g, '');
    if (!digits) {
      newErrors.phone = t.lead.phoneRequired;
    } else if (!/^[0-9]{9}$/.test(digits)) {
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
        source,
        product_id: productId,
        page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        locale,
      };
      await createLead(payload);
      setSuccess(true);
    } catch {
      setErrors({ phone: t.common.error });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset after transition
    setTimeout(() => {
      setForm({ name: '', phone: '', message: '' });
      setErrors({});
      setSuccess(false);
    }, 300);
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-orange-500 px-6 py-5 relative">
                  <Dialog.Title className="text-lg font-bold text-white">
                    {source === 'product' && productTitle
                      ? t.lead.title
                      : t.lead.titleGeneral}
                  </Dialog.Title>
                  {productTitle && (
                    <p className="text-orange-100 text-sm mt-0.5 truncate">{productTitle}</p>
                  )}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    aria-label={t.common.close}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center py-6 gap-4"
                      >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-9 h-9 text-green-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{t.lead.success}</h3>
                          <p className="text-gray-500 mt-1 text-sm">{t.lead.successMessage}</p>
                        </div>
                        <button
                          onClick={handleClose}
                          className="mt-2 bg-orange-500 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                        >
                          {t.common.close}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                      >
                        {source === 'product' && (
                          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 -mt-1 mb-1">
                            <p className="text-sm text-orange-700 font-medium">
                              Əlaqə vasitənizi daxil edin, əməkdaşımız ən qısa zamanda geri dönüş edəcək.
                            </p>
                          </div>
                        )}
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.lead.name}
                          </label>
                          <input
                            type="text"
                            placeholder={t.lead.namePlaceholder}
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.lead.phone}{' '}
                            <span className="text-red-500">*</span>
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
                                if (errors.phone) setErrors((err) => ({ ...err, phone: undefined }));
                              }}
                              className={`w-full px-4 py-2.5 rounded-r-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-400">{t.lead.phoneHint}</p>
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.lead.message}
                          </label>
                          <textarea
                            rows={3}
                            placeholder={t.lead.messagePlaceholder}
                            value={form.message}
                            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                          />
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-base hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              {t.lead.submitting}
                            </>
                          ) : (
                            t.lead.submit
                          )}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
