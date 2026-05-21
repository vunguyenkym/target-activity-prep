'use client';

import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TrendingUp, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { saveActivity, type Activity, type MdeType } from '@/lib/storage';
import {
  computeOutputs,
  computeSensitivity,
  type SensitivityRow,
} from '@/lib/sample-size';
import { SectionLabel } from '@/components/section-label';

type Inputs = Activity['sampleSize']['inputs'];

export function SampleSizeForm({ activity }: { activity: Activity }) {
  const form = useForm<Inputs>({ defaultValues: activity.sampleSize.inputs });
  const inputs = form.watch();

  const outputs = useMemo(() => computeOutputs(inputs), [inputs]);
  const sensitivity = useMemo(() => computeSensitivity(inputs), [inputs]);

  const persist = async () => {
    const values = form.getValues();
    await saveActivity({
      ...activity,
      sampleSize: {
        inputs: values,
        outputs: computeOutputs(values),
        sensitivity: computeSensitivity(values),
      },
    });
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-5">
        <Field
          id="baselineRate"
          label="Baseline conversion rate (%)"
          helper="Your current rate for the chosen metric — e.g. 4% if 4 of 100 visitors convert. Pull from analytics or a recent run, not a guess."
        >
          <Input
            id="baselineRate"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="100"
            className="w-32"
            {...form.register('baselineRate', {
              valueAsNumber: true,
              onBlur: persist,
            })}
          />
        </Field>

        <Field
          id="mde"
          label="Minimum detectable effect"
          helper="The smallest change you'd actually act on. Asking for a tighter MDE than you'd genuinely use just blows up your sample size for no business reason."
        >
          <div className="flex gap-2">
            <Input
              id="mde"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              className="w-32"
              {...form.register('mde', {
                valueAsNumber: true,
                onBlur: persist,
              })}
            />
            <Controller
              control={form.control}
              name="mdeType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    if (typeof v !== 'string') return;
                    field.onChange(v as MdeType);
                    void persist();
                  }}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relative">% relative lift</SelectItem>
                    <SelectItem value="absolute">absolute pp</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </Field>

        <Field
          id="expectedLiftNarrative"
          label="Expected lift (narrative)"
          helper="Optional. What outcome are you hoping for, in plain English? Sample size uses the MDE above — this is for the activity story."
        >
          <Input
            id="expectedLiftNarrative"
            placeholder="e.g., we expect a small but consistent lift on form starts from returning visitors"
            {...form.register('expectedLiftNarrative', { onBlur: persist })}
          />
        </Field>

        <Field
          id="confidence"
          label="Confidence"
          helper="How sure you want to be that an apparent winner isn't noise. 95% is the industry default; 99% for high-stakes calls; 90% only when speed matters more than certainty."
        >
          <Controller
            control={form.control}
            name="confidence"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(v) => {
                  if (typeof v !== 'string') return;
                  field.onChange(Number(v));
                  void persist();
                }}
              >
                <SelectTrigger id="confidence" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                  <SelectItem value="99">99%</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          id="power"
          label="Power"
          helper="Chance of catching a real effect when one exists. 80% is the usual default; 90% reduces missed wins but needs a noticeably larger sample."
        >
          <Controller
            control={form.control}
            name="power"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(v) => {
                  if (typeof v !== 'string') return;
                  field.onChange(Number(v));
                  void persist();
                }}
              >
                <SelectTrigger id="power" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field id="variants" label="Variants (incl. control)">
            <Input
              id="variants"
              type="number"
              inputMode="numeric"
              step="1"
              min="2"
              className="w-32"
              {...form.register('variants', {
                valueAsNumber: true,
                onBlur: persist,
              })}
            />
          </Field>
          <Field id="dailyTraffic" label="Daily traffic in scope">
            <Input
              id="dailyTraffic"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              className="w-32"
              {...form.register('dailyTraffic', {
                valueAsNumber: true,
                onBlur: persist,
              })}
            />
          </Field>
        </div>
      </div>

      <section
        aria-label="Required sample"
        className="relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-accent via-card to-card p-5 shadow-sm"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-[oklch(0.65_0.22_320)]"
        />
        <SectionLabel icon={Users} tone="primary" className="mb-3">
          Required sample
        </SectionLabel>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Per variant" value={formatNumber(outputs.perVariant)} />
          <Stat label="Total visitors" value={formatNumber(outputs.total)} />
          <Stat label="Estimated days" value={formatNumber(outputs.days)} />
        </div>
      </section>

      <section aria-label="Sensitivity" className="space-y-2">
        <SectionLabel icon={TrendingUp}>Sensitivity</SectionLabel>
        <p className="max-w-md text-xs text-muted-foreground">
          What happens if your MDE drifts? The highlighted row matches your
          current MDE.
        </p>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">MDE used</th>
                <th className="px-3 py-2 text-right font-medium">
                  Per variant
                </th>
                <th className="px-3 py-2 text-right font-medium">
                  Estimated days
                </th>
              </tr>
            </thead>
            <tbody>
              {sensitivity.map((row) => (
                <tr
                  key={row.mdeMultiplier}
                  className={cn(
                    'border-t border-border/70 transition-colors',
                    row.mdeMultiplier === 1
                      ? 'bg-primary/10 font-medium text-foreground ring-1 ring-inset ring-primary/20'
                      : 'hover:bg-muted/40',
                  )}
                >
                  <td className="px-3 py-2">{formatMdeCell(row, inputs)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatNumber(row.perVariant)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatNumber(row.days)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <a
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
        href="https://experienceleague.adobe.com/tools/calculator/testcalculator.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        Cross-check with Adobe&apos;s public calculator
        <span aria-hidden>↗</span>
      </a>
    </form>
  );
}

function Field({
  id,
  label,
  helper,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {helper && (
        <p className="max-w-md text-xs text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  return n > 0 ? n.toLocaleString() : '—';
}

function formatMdeCell(row: SensitivityRow, inputs: Inputs): string {
  if (!Number.isFinite(inputs.mde) || inputs.mde <= 0) {
    return `${row.mdeMultiplier}×`;
  }
  const adjustedMde = inputs.mde * row.mdeMultiplier;
  const value = Number.isInteger(adjustedMde)
    ? String(adjustedMde)
    : adjustedMde.toFixed(2);
  const suffix = inputs.mdeType === 'absolute' ? ' pp' : '% relative';
  return `${row.mdeMultiplier}× · ${value}${suffix}`;
}
