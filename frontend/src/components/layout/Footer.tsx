import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import type { Locale, Category, Settings } from '@/types';
import type { Translations } from '@/i18n/az';

interface FooterProps {
  locale: Locale;
  t: Translations;
  categories?: Category[];
  settings?: Settings | null;
}

// Simple SVG social icons (lucide-react v1 doesn't include brand icons)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}

const quickLinks = (locale: Locale, t: Translations) => [
  { label: t.nav.home, href: `/` },
  { label: t.nav.products, href: `/products` },
  { label: t.nav.gallery, href: `/gallery` },
  { label: t.nav.blog, href: `/blog` },
  { label: t.nav.contact, href: `/contact` },
];

export default function Footer({ locale, t, categories = [], settings }: FooterProps) {
  return (
    <footer style={{ backgroundColor: '#1a1a1a' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 - About */}
          <div>
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-dark.svg"
                alt="4WD.az"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t.footer.aboutText}</p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              {settings?.instagram_url ? (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              ) : (
                <span className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <InstagramIcon className="w-4 h-4 text-gray-500" />
                </span>
              )}
              {settings?.facebook_url ? (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              ) : (
                <span className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <FacebookIcon className="w-4 h-4 text-gray-500" />
                </span>
              )}
              {settings?.youtube_url ? (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              ) : (
                <span className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <YoutubeIcon className="w-4 h-4 text-gray-500" />
                </span>
              )}
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks(locale, t).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Categories */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">
              {t.footer.categories}
            </h3>
            {categories.length > 0 ? (
              <ul className="space-y-2.5">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="text-gray-400 text-sm hover:text-orange-400 transition-colors"
                    >
                      {locale === 'az' ? cat.name_az || cat.name : cat.name_en || cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">—</p>
            )}
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">
              {t.footer.contact}
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <a
                  href={`tel:${settings?.contact_phone?.replace(/\s/g, '') ?? '+994501234567'}`}
                  className="hover:text-orange-400 transition-colors"
                >
                  {settings?.contact_phone || '+994 50 123 45 67'}
                </a>
              </li>
              {settings?.contact_email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="hover:text-orange-400 transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {(settings?.address_az || settings?.address_en) && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>
                    {locale === 'az'
                      ? settings?.address_az
                      : settings?.address_en}
                  </span>
                </li>
              )}
              {(settings?.working_hours_az || settings?.working_hours_en) && (
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>
                    {locale === 'az'
                      ? settings?.working_hours_az
                      : settings?.working_hours_en}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} 4WD.az. Bütün hüquqlar qorunur.
        </div>
      </div>
    </footer>
  );
}
