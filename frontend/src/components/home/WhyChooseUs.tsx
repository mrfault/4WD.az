import { ShieldCheck, Wrench, Truck, Headphones } from 'lucide-react';
import type { Translations } from '@/i18n/az';
import SectionHeader from '@/components/shared/SectionHeader';

interface WhyChooseUsProps {
  t: Translations;
}

export default function WhyChooseUs({ t }: WhyChooseUsProps) {
  const features = [
    {
      icon: ShieldCheck,
      title: t.why.qualityParts,
      desc: t.why.qualityPartsDesc,
      color: 'text-orange-500',
      bg: 'bg-orange-100',
    },
    {
      icon: Wrench,
      title: t.why.expertInstall,
      desc: t.why.expertInstallDesc,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
    },
    {
      icon: Truck,
      title: t.why.fastDelivery,
      desc: t.why.fastDeliveryDesc,
      color: 'text-green-500',
      bg: 'bg-green-100',
    },
    {
      icon: Headphones,
      title: t.why.support,
      desc: t.why.supportDesc,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.home.whyChooseUs}
          subtitle={t.home.whyChooseUsSubtitle}
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 text-center"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
