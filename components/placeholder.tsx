import { Sparkles } from 'lucide-react';

export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 via-accent to-card text-primary shadow-sm ring-1 ring-primary/15">
        <Sparkles className="size-6" strokeWidth={1.75} />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Coming in a future iteration
      </p>
    </div>
  );
}
