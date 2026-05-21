'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChecklistRow({
  checked,
  onChange,
  label,
  helper,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  helper?: string;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={cn(
          'flex w-full items-start gap-3 rounded-md border p-3.5 text-left transition-colors',
          checked
            ? 'border-primary/30 bg-primary/5'
            : 'border-border bg-card hover:bg-muted/40',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition-colors',
            checked
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card',
          )}
        >
          {checked && <Check className="size-3" strokeWidth={3} />}
        </span>
        <span className="flex-1">
          <span className="block text-sm font-medium text-foreground">
            {label}
          </span>
          {helper && (
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {helper}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}
