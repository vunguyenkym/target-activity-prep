export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
    </header>
  );
}
