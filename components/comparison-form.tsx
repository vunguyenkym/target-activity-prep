'use client';

import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScreenshotField } from '@/components/screenshot-field';
import { saveActivity, type Activity, type Variant } from '@/lib/storage';
import { cn } from '@/lib/utils';

type ComparisonValues = Activity['comparison'];

const MAX_VARIANTS = 4;

export function ComparisonForm({ activity }: { activity: Activity }) {
  const form = useForm<ComparisonValues>({
    defaultValues: activity.comparison,
  });

  const variants = useFieldArray({
    control: form.control,
    name: 'variants',
    keyName: '_key',
  });

  const persist = async () => {
    await saveActivity({
      ...activity,
      comparison: form.getValues(),
    });
  };

  const addVariant = () => {
    if (variants.fields.length >= MAX_VARIANTS) return;
    const next: Variant = {
      id: crypto.randomUUID(),
      name: `Variant ${variants.fields.length + 1}`,
      description: '',
      url: '',
      splitPercent: 0,
      screenshot: '',
    };
    variants.append(next);
    void persist();
  };

  const removeVariant = (idx: number) => {
    variants.remove(idx);
    void persist();
  };

  const watched = form.watch();
  const variantsTotal = useMemo(() => {
    return (watched.variants ?? []).reduce((sum, v) => {
      const n = Number(v?.splitPercent);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
  }, [watched.variants]);
  const controlImplied = 100 - variantsTotal;

  let splitState: 'ok' | 'underfilled' | 'over' = 'ok';
  if (variantsTotal > 100) splitState = 'over';
  else if (variantsTotal < 100 && variants.fields.length === 0) splitState = 'underfilled';
  else if (variantsTotal < 100 && variantsTotal > 0) splitState = 'underfilled';

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <article className="rounded-xl border border-border bg-muted/30 p-5 shadow-sm">
        <header className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Control
          </span>
          <ImpliedSplit value={controlImplied} />
        </header>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="controlName">Name</Label>
            <Input
              id="controlName"
              {...form.register('control.name', { onBlur: persist })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="controlDescription">Description</Label>
            <Textarea
              id="controlDescription"
              rows={2}
              placeholder="The current experience as it stands today."
              {...form.register('control.description', { onBlur: persist })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="controlUrl">Staged URL (optional)</Label>
            <Input
              id="controlUrl"
              type="url"
              placeholder="https://stage.example.com/control"
              {...form.register('control.url', { onBlur: persist })}
            />
          </div>
          <ScreenshotField
            label="Screenshot / mock-up"
            value={form.watch('control.screenshot') ?? ''}
            alt="Control screenshot"
            onChange={(next) => {
              form.setValue('control.screenshot', next, { shouldDirty: true });
              void persist();
            }}
          />
        </div>
      </article>

      {variants.fields.map((f, idx) => (
        <article
          key={f._key}
          className="rounded-xl border border-primary/15 bg-card p-5 shadow-sm"
        >
          <header className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Variant {idx + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeVariant(idx)}
              aria-label={`Remove variant ${idx + 1}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </header>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`variant-${idx}-name`}>Name</Label>
              <Input
                id={`variant-${idx}-name`}
                {...form.register(`variants.${idx}.name`, { onBlur: persist })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`variant-${idx}-description`}>Description</Label>
              <Textarea
                id={`variant-${idx}-description`}
                rows={2}
                placeholder="What changes in this variant — concrete, not aspirational."
                {...form.register(`variants.${idx}.description`, {
                  onBlur: persist,
                })}
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`variant-${idx}-url`}>Staged URL</Label>
                <Input
                  id={`variant-${idx}-url`}
                  type="url"
                  placeholder="https://stage.example.com/variant"
                  {...form.register(`variants.${idx}.url`, {
                    onBlur: persist,
                  })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`variant-${idx}-split`}>Split %</Label>
                <Input
                  id={`variant-${idx}-split`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  step="1"
                  className="w-24"
                  {...form.register(`variants.${idx}.splitPercent`, {
                    valueAsNumber: true,
                    onBlur: persist,
                  })}
                />
              </div>
            </div>
            <ScreenshotField
              label="Screenshot / mock-up"
              value={form.watch(`variants.${idx}.screenshot`) ?? ''}
              alt={`Variant ${idx + 1} screenshot`}
              onChange={(next) => {
                form.setValue(`variants.${idx}.screenshot`, next, {
                  shouldDirty: true,
                });
                void persist();
              }}
            />
          </div>
        </article>
      ))}

      {variants.fields.length < MAX_VARIANTS ? (
        <Button type="button" variant="outline" onClick={addVariant}>
          <Plus className="size-4" /> Add variant
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          Maximum of {MAX_VARIANTS} variants.
        </p>
      )}

      <div
        className={cn(
          'flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm',
          splitState === 'over'
            ? 'border-destructive/40 bg-destructive/10 text-destructive'
            : splitState === 'underfilled'
              ? 'border-border bg-muted/30 text-muted-foreground'
              : 'border-primary/20 bg-accent text-foreground',
        )}
      >
        <span>Traffic split — variants total</span>
        <span className="font-semibold tabular-nums">
          {variantsTotal}% / 100%{' '}
          <span className="font-normal text-muted-foreground">
            (control: {Math.max(0, controlImplied)}%)
          </span>
        </span>
      </div>
    </form>
  );
}

function ImpliedSplit({ value }: { value: number }) {
  return (
    <span className="text-xs tabular-nums text-muted-foreground">
      Split implied: {Math.max(0, value)}%
    </span>
  );
}
