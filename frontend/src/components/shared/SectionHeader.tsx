interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  action?: React.ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  centered = false,
  action,
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-end justify-between mb-8 gap-4 ${centered ? 'flex-col items-center text-center' : ''}`}
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{title}</h2>
        {subtitle && <p className="mt-2 text-gray-500 text-sm md:text-base">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
