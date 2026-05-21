'use client';

import { Check, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toggle({
  checked,
  onChange,
  children,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors',
        checked
          ? 'border-primary/30 bg-primary/10 text-foreground'
          : 'border-border bg-card text-foreground/85 hover:bg-muted',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid size-4 shrink-0 place-items-center rounded border transition-colors',
          checked
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-card text-transparent',
        )}
      >
        {checked ? (
          <Check className="size-3" strokeWidth={3} />
        ) : (
          <Square className="size-3 opacity-0" />
        )}
      </span>
      <span>{children}</span>
    </button>
  );
}
