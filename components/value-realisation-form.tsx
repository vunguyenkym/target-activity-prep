'use client';

import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Coins, Equal, Sigma, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionLabel } from '@/components/section-label';
import {
  makeDefaultActivity,
  saveActivity,
  type Activity,
  type ValueImpactType,
} from '@/lib/storage';
import {
  VALUE_IMPACT_LABELS,
  VALUE_IMPACT_OPTIONS,
  computeValueImpact,
  formatCurrency,
  formatNumber,
} from '@/lib/value-realisation';

type ValueValues = Activity['valueRealisation'];

export function ValueRealisationForm({ activity }: { activity: Activity }) {
  const form = useForm<ValueValues>({
    defaultValues: activity.valueRealisation,
  });

  const persist = async () => {
    await saveActivity({
      ...activity,
      valueRealisation: form.getValues(),
    });
  };

  const watched = form.watch();
  const impact = useMemo(() => computeValueImpact(watched), [watched]);

  const loadExample = async () => {
    if (
      !window.confirm(
        'Load example Value Realisation numbers? This replaces the current values in this section only.',
      )
    ) {
      return;
    }
    const example = await makeDefaultActivity();
    form.reset(example.valueRealisation);
    await saveActivity({
      ...activity,
      valueRealisation: example.valueRealisation,
    });
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={loadExample}>
          <Sparkles className="size-3.5" />
          Load example
        </Button>
      </div>

      <section
        aria-label="Value impact"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <SectionLabel icon={Equal} tone="primary" className="mb-4">
          Estimated annual impact
        </SectionLabel>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatCurrency(impact)}
          </span>
          <span className="text-sm text-muted-foreground">
            {VALUE_IMPACT_LABELS[watched.impactType]} (annualised)
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">A × B × C</span> from
          the Adobe value-realisation framework. Edit the inputs below and
          watch the impact recompute.
        </p>
      </section>

      <section className="space-y-5">
        <SectionLabel icon={Sigma}>A — Driver</SectionLabel>
        <p className="max-w-xl text-xs text-muted-foreground">
          The volume the activity touches over the measurement window —
          baseline conversions, annual ad spend, exposed visitors, completed
          jobs. Pick the unit that matches your business case.
        </p>
        <div className="grid grid-cols-[1fr_minmax(0,180px)] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="driverLabel">Driver label</Label>
            <Input
              id="driverLabel"
              placeholder="e.g., Annual conversions at baseline"
              {...form.register('driverLabel', { onBlur: persist })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="driverValue">Value</Label>
            <Input
              id="driverValue"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              {...form.register('driverValue', {
                valueAsNumber: true,
                onBlur: persist,
              })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionLabel icon={Sigma}>B — Performance change</SectionLabel>
        <p className="max-w-xl text-xs text-muted-foreground">
          The lift over baseline or holdout, expressed as a percentage.
          Mirror the MDE you targeted, then revise against the observed lift
          once the test reads out.
        </p>
        <div className="grid grid-cols-[1fr_minmax(0,180px)] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="changeLabel">Change label</Label>
            <Input
              id="changeLabel"
              placeholder="e.g., Incremental conversion uplift"
              {...form.register('changeLabel', { onBlur: persist })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="changePercent">Uplift (%)</Label>
            <Input
              id="changePercent"
              type="number"
              inputMode="decimal"
              step="0.1"
              {...form.register('changePercent', {
                valueAsNumber: true,
                onBlur: persist,
              })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionLabel icon={Coins}>C — Financial valuation</SectionLabel>
        <p className="max-w-xl text-xs text-muted-foreground">
          Dollar value of one unit of the driver — AOV, value per lead,
          subscription price, FTE hourly cost. Use a defensible proxy and
          document the source.
        </p>
        <div className="grid grid-cols-[1fr_minmax(0,180px)] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="valuationLabel">Valuation label</Label>
            <Input
              id="valuationLabel"
              placeholder="e.g., Average order value (AUD)"
              {...form.register('valuationLabel', { onBlur: persist })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="valuationValue">Value ($)</Label>
            <Input
              id="valuationValue"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              {...form.register('valuationValue', {
                valueAsNumber: true,
                onBlur: persist,
              })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="impactType">Impact type</Label>
        <Controller
          control={form.control}
          name="impactType"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => {
                if (typeof v !== 'string') return;
                field.onChange(v as ValueImpactType);
                void persist();
              }}
            >
              <SelectTrigger id="impactType" className="w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VALUE_IMPACT_OPTIONS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </section>

      <section className="space-y-2">
        <Label htmlFor="methodologyNotes">Methodology notes</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          How was each input derived — analytics window, holdout vs baseline,
          assumptions. Anyone reading the activity summary should be able to
          re-derive the number from this.
        </p>
        <Textarea
          id="methodologyNotes"
          rows={4}
          {...form.register('methodologyNotes', { onBlur: persist })}
        />
      </section>

      <section className="space-y-2">
        <Label htmlFor="caveats">Caveats &amp; sensitivity</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          What could change this number — sensitivity ranges, decay
          assumptions, segment overlaps. Honest caveats here build credibility
          with finance partners.
        </p>
        <Textarea
          id="caveats"
          rows={3}
          {...form.register('caveats', { onBlur: persist })}
        />
      </section>

      <section className="rounded-md border border-border bg-muted/30 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Calculation breakdown
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          <span className="tabular-nums font-medium">
            {formatNumber(watched.driverValue)}
          </span>{' '}
          <span className="text-muted-foreground">×</span>{' '}
          <span className="tabular-nums font-medium">
            {watched.changePercent}%
          </span>{' '}
          <span className="text-muted-foreground">×</span>{' '}
          <span className="tabular-nums font-medium">
            {formatCurrency(watched.valuationValue)}
          </span>{' '}
          <span className="text-muted-foreground">=</span>{' '}
          <span className="tabular-nums font-semibold text-primary">
            {formatCurrency(impact)}
          </span>
        </p>
      </section>
    </form>
  );
}
