import type { LucideIcon } from 'lucide-react';

export function SectionLabel({
  icon: Icon,
  children,
  className = '',
  tone = 'muted',
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  tone?: 'muted' | 'primary';
}) {
  const toneClass =
    tone === 'primary' ? 'text-primary' : 'text-muted-foreground';
  return (
    <div
      className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${toneClass} ${className}`}
    >
      <Icon className="size-3.5" strokeWidth={2} aria-hidden />
      <span>{children}</span>
    </div>
  );
}
