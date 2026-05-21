'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Archive,
  ArrowDownToLine,
  BookCheck,
  CircleDollarSign,
  Lightbulb,
  Target as TargetIcon,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/section-label';
import { Toggle } from '@/components/toggle';
import { saveActivity, type Activity } from '@/lib/storage';
import {
  computeValueImpact,
  formatCurrency,
  formatNumber,
} from '@/lib/value-realisation';
import { generateActivitySummaryPdf } from '@/lib/summary-pdf';
import { cn } from '@/lib/utils';

type ArchiveValues = Activity['archive'];

const OUTCOME_LABELS: Record<string, string> = {
  won: 'Won',
  lost: 'Lost',
  inconclusive: 'Inconclusive',
};

export function ArchiveForm({ activity }: { activity: Activity }) {
  const form = useForm<ArchiveValues>({ defaultValues: activity.archive });
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the activity is updated by Load Example on another page, the RHF
  // form would otherwise hold its old defaultValues. Reset whenever the
  // archive section changes — but only when the user hasn't started typing
  // (form not dirty), so we don't fight their in-progress edits.
  useEffect(() => {
    if (!form.formState.isDirty) {
      form.reset(activity.archive);
    }
  }, [activity.archive, form]);

  const persist = async () => {
    const values = form.getValues();
    await saveActivity({ ...activity, archive: values });
    // Clear isDirty so the next external update can flow in.
    form.reset(values);
  };

  const status = form.watch('status');
  const isArchived = status === 'archived';

  const readiness = checkRequired(activity);

  const handleDownload = async () => {
    setError(null);
    setDownloading(true);
    try {
      const blob = await generateActivitySummaryPdf(activity);
      const url = URL.createObjectURL(blob);
      const fileName = sanitizeFileName(activity.overview.name);
      triggerDownload(url, `${fileName}-summary.pdf`);
      URL.revokeObjectURL(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(`Could not generate the summary: ${message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <section className="space-y-3">
        <SectionLabel icon={BookCheck} tone="primary">
          Activity summary
        </SectionLabel>
        <ActivityRecap activity={activity} />
      </section>

      <section className="space-y-2">
        <SectionLabel icon={Lightbulb}>Key findings</SectionLabel>
        <p className="max-w-xl text-xs text-muted-foreground">
          What would you tell the next person picking up an activity like
          this? Surprises, what worked, what wouldn&apos;t you repeat,
          implications for the roadmap. Add as much as is useful.
        </p>
        <Textarea
          id="keyFindings"
          rows={6}
          placeholder="Personalisation by recent-category proved higher leverage than copy variation. Plan iterating on the secondary CTA next sprint."
          {...form.register('keyFindings', { onBlur: persist })}
        />
      </section>

      <section className="space-y-2">
        <SectionLabel icon={Archive}>Status</SectionLabel>
        <div
          className={cn(
            'flex items-center justify-between gap-4 rounded-md border px-4 py-3',
            isArchived
              ? 'border-primary/30 bg-primary/5'
              : 'border-border bg-card',
          )}
        >
          <div>
            <p className="text-sm font-medium">
              {isArchived ? 'Archived' : 'Active'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isArchived
                ? 'This activity is recorded as complete in your institutional memory.'
                : 'Toggle on once results are documented and the activity is officially closed.'}
            </p>
          </div>
          <Toggle
            checked={isArchived}
            onChange={(next) => {
              form.setValue('status', next ? 'archived' : 'active', {
                shouldDirty: true,
              });
              void persist();
            }}
          >
            {isArchived ? 'Archived' : 'Mark as archived'}
          </Toggle>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary ring-1 ring-primary/15">
            <ArrowDownToLine className="size-5" strokeWidth={1.75} />
          </span>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-foreground">Download</p>
            <p className="text-sm text-muted-foreground">
              Download Activity Summary
            </p>
            {!readiness.ready && (
              <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                {readiness.missing.map((m) => (
                  <li key={m}>
                    <span aria-hidden className="mr-1">
                      ·
                    </span>
                    Missing: {m}
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            disabled={!readiness.ready || downloading}
          >
            <ArrowDownToLine className="size-4" />
            {downloading ? 'Preparing…' : 'Download'}
          </Button>
        </div>
      </section>
    </form>
  );
}

function ActivityRecap({ activity }: { activity: Activity }) {
  const { overview, hypothesis, metrics, sampleSize, comparison, evaluation } =
    activity;
  const impact = computeValueImpact(activity.valueRealisation);
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <header className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {overview.activityType || 'Activity'}
          {overview.workspace ? ` · ${overview.workspace}` : ''}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {overview.name || 'Untitled activity'}
        </h2>
        {overview.kbo && (
          <p className="mt-2 text-sm text-muted-foreground">{overview.kbo}</p>
        )}
      </header>

      {hypothesis.statement && (
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Hypothesis
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            {hypothesis.statement}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border/70 pt-5 md:grid-cols-3">
        <RecapField
          icon={TargetIcon}
          label="Primary metric"
          value={metrics.primary?.name ?? '—'}
        />
        <RecapField
          label="Variants"
          value={String(comparison.variants.length + 1)}
        />
        <RecapField
          label="Estimated duration"
          value={
            sampleSize.outputs.days > 0
              ? `${sampleSize.outputs.days} days`
              : '—'
          }
        />
        <RecapField
          label="Outcome"
          value={
            evaluation.outcome ? OUTCOME_LABELS[evaluation.outcome] : '—'
          }
        />
        <RecapField
          label="Observed lift"
          value={evaluation.observedLift || '—'}
        />
        <RecapField
          icon={CircleDollarSign}
          label="Value (annualised)"
          value={impact > 0 ? formatCurrency(impact) : '—'}
        />
      </div>

      {evaluation.recommendedNextStep && (
        <div className="mt-5 border-t border-border/70 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Recommended next step
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            {evaluation.recommendedNextStep}
          </p>
        </div>
      )}

      {(activity.valueRealisation.driverValue > 0 ||
        activity.valueRealisation.changePercent !== 0) && (
        <div className="mt-5 rounded-md border border-border bg-muted/30 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Value calculation
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            <span className="tabular-nums">
              {formatNumber(activity.valueRealisation.driverValue)}
            </span>{' '}
            ×{' '}
            <span className="tabular-nums">
              {activity.valueRealisation.changePercent}%
            </span>{' '}
            ×{' '}
            <span className="tabular-nums">
              {formatCurrency(activity.valueRealisation.valuationValue)}
            </span>{' '}
            ={' '}
            <span className="font-semibold tabular-nums text-primary">
              {formatCurrency(impact)}
            </span>
          </p>
        </div>
      )}
    </article>
  );
}

function RecapField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof TargetIcon;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3" strokeWidth={2} aria-hidden />}
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

type Readiness = { ready: boolean; missing: string[] };

function checkRequired(activity: Activity): Readiness {
  const missing: string[] = [];
  if ((activity.overview?.name ?? '').trim() === '') {
    missing.push('Activity name');
  }
  if (!activity.metrics?.primary) missing.push('Primary metric');
  if (!activity.evaluation || activity.evaluation.outcome === '') {
    missing.push('Evaluation outcome');
  }
  if ((activity.evaluation?.recommendedNextStep ?? '').trim() === '') {
    missing.push('Recommended next step');
  }
  const v = activity.valueRealisation;
  if (!v || v.driverValue <= 0) missing.push('Value driver (A)');
  if (!v || v.changePercent === 0) missing.push('Performance change (B)');
  if (!v || v.valuationValue <= 0) missing.push('Financial valuation (C)');
  return { ready: missing.length === 0, missing };
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'activity';
}

function triggerDownload(href: string, fileName: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
