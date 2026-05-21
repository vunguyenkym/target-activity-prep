import type { LucideIcon } from 'lucide-react';

export function KnowledgeCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start gap-3">
        {Icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary ring-1 ring-primary/15">
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
        )}
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm leading-snug text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2 pl-12 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </article>
  );
}

export function KnowledgeNote({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p>
      <span className="font-medium text-foreground">{label}:</span>{' '}
      <span className="text-muted-foreground">{children}</span>
    </p>
  );
}

export function ExperienceLeagueLink({ href }: { href: string }) {
  return (
    <a
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      Read more on Adobe Experience League
      <span aria-hidden>↗</span>
    </a>
  );
}
