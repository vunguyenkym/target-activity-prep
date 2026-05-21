'use client';

import { useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { BarChart3, Lightbulb, Plus, Quote } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { saveActivity, type Activity, type Metric } from '@/lib/storage';
import { composeStatement, metricFromType } from '@/lib/metrics';
import { MetricPicker } from '@/components/metric-picker';
import { SectionLabel } from '@/components/section-label';

type HypothesisKey =
  | 'currentState'
  | 'change'
  | 'outcome'
  | 'reasoning'
  | 'audienceScope';

type FormValues = {
  hypothesis: Activity['hypothesis'];
  metrics: Activity['metrics'];
};

const HELPERS: Record<HypothesisKey, string> = {
  currentState:
    "What people see and do today on the page or flow you're touching.",
  change:
    "What's different in the new experience — describe the actual variation, not the hoped-for effect.",
  outcome: 'The observable behavior you expect to shift, in business or user terms.',
  reasoning:
    'Why you believe the change will cause that outcome — research, prior tests, heuristic, customer evidence.',
  audienceScope:
    "Who the test applies to: page, segment, device, traffic source, or 'all visitors to the homepage'.",
};

const LABELS: Record<HypothesisKey, string> = {
  currentState: 'Current state',
  change: 'Change',
  outcome: 'Outcome',
  reasoning: 'Reasoning',
  audienceScope: 'Audience & scope',
};

const HYPOTHESIS_FIELDS: HypothesisKey[] = [
  'currentState',
  'change',
  'outcome',
  'reasoning',
  'audienceScope',
];

export function HypothesisForm({ activity }: { activity: Activity }) {
  const form = useForm<FormValues>({
    defaultValues: {
      hypothesis: activity.hypothesis,
      metrics: activity.metrics,
    },
  });

  const secondary = useFieldArray({
    control: form.control,
    name: 'metrics.secondary',
  });
  const guardrails = useFieldArray({
    control: form.control,
    name: 'metrics.guardrails',
  });

  const values = form.watch();

  const statement = useMemo(
    () =>
      composeStatement({
        audienceScope: values.hypothesis?.audienceScope ?? '',
        change: values.hypothesis?.change ?? '',
        outcome: values.hypothesis?.outcome ?? '',
        reasoning: values.hypothesis?.reasoning ?? '',
        primaryName: values.metrics?.primary?.name ?? null,
        mde: activity.sampleSize.inputs.mde,
        mdeType: activity.sampleSize.inputs.mdeType,
        days: activity.sampleSize.outputs.days,
      }),
    [values, activity.sampleSize],
  );

  const persist = async () => {
    const v = form.getValues();
    const computedStatement = composeStatement({
      audienceScope: v.hypothesis.audienceScope,
      change: v.hypothesis.change,
      outcome: v.hypothesis.outcome,
      reasoning: v.hypothesis.reasoning,
      primaryName: v.metrics.primary?.name ?? null,
      mde: activity.sampleSize.inputs.mde,
      mdeType: activity.sampleSize.inputs.mdeType,
      days: activity.sampleSize.outputs.days,
    });
    await saveActivity({
      ...activity,
      hypothesis: { ...v.hypothesis, statement: computedStatement },
      metrics: stripFieldArrayIds(v.metrics),
    });
  };

  const addSecondary = () => {
    if (secondary.fields.length >= 3) return;
    secondary.append(metricFromType('conversion_rate'));
    void persist();
  };

  const addGuardrail = () => {
    if (guardrails.fields.length >= 3) return;
    guardrails.append(metricFromType('custom'));
    void persist();
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <section className="space-y-5">
        <SectionLabel icon={Lightbulb}>Hypothesis</SectionLabel>
        {HYPOTHESIS_FIELDS.map((k) => (
          <div key={k} className="space-y-1.5">
            <Label htmlFor={k}>{LABELS[k]}</Label>
            <p className="text-xs text-muted-foreground">{HELPERS[k]}</p>
            <Textarea
              id={k}
              rows={2}
              {...form.register(`hypothesis.${k}`, { onBlur: persist })}
            />
          </div>
        ))}
      </section>

      <section
        aria-label="Statement"
        className="relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-accent via-card to-card p-5 shadow-sm"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-[oklch(0.65_0.22_320)]"
        />
        <SectionLabel icon={Quote} tone="primary" className="mb-2">
          Statement
        </SectionLabel>
        <p className="text-[15px] leading-relaxed text-foreground">
          {statement}
        </p>
      </section>

      <section className="space-y-6">
        <SectionLabel icon={BarChart3}>Metrics</SectionLabel>

        <div className="space-y-2">
          <Label>
            Primary metric <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={form.control}
            name="metrics.primary"
            render={({ field }) => (
              <MetricPicker
                value={field.value}
                onChange={(next: Metric) => field.onChange(next)}
                onPersist={persist}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Secondary metrics</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSecondary}
              disabled={secondary.fields.length >= 3}
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {secondary.fields.length === 0 && (
            <p className="text-xs text-muted-foreground">
              None yet — add up to 3.
            </p>
          )}
          <ul className="space-y-2">
            {secondary.fields.map((f, idx) => (
              <li key={f.id}>
                <Controller
                  control={form.control}
                  name={`metrics.secondary.${idx}`}
                  render={({ field }) => (
                    <MetricPicker
                      value={field.value}
                      onChange={(next: Metric) => field.onChange(next)}
                      onPersist={persist}
                      onRemove={() => secondary.remove(idx)}
                    />
                  )}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Guardrails</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGuardrail}
              disabled={guardrails.fields.length >= 3}
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {guardrails.fields.length === 0 && (
            <p className="text-xs text-muted-foreground">
              None — add up to 3.
            </p>
          )}
          <ul className="space-y-2">
            {guardrails.fields.map((f, idx) => (
              <li key={f.id}>
                <Controller
                  control={form.control}
                  name={`metrics.guardrails.${idx}`}
                  render={({ field }) => (
                    <MetricPicker
                      value={field.value}
                      onChange={(next: Metric) => field.onChange(next)}
                      onPersist={persist}
                      onRemove={() => guardrails.remove(idx)}
                    />
                  )}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessSignificanceThreshold">
            Business-significance threshold
          </Label>
          <p className="max-w-xl text-xs text-muted-foreground">
            What lift on the primary metric would justify rolling this out?
            Decide this before launch so &quot;statistically significant&quot;
            doesn&apos;t get confused with &quot;worth the engineering cost.&quot;
          </p>
          <Input
            id="businessSignificanceThreshold"
            placeholder="e.g., +2% absolute on form completion, sustained for 4 weeks"
            {...form.register('metrics.businessSignificanceThreshold', {
              onBlur: persist,
            })}
          />
        </div>
      </section>
    </form>
  );
}

// useFieldArray injects an internal `id` field on each item for React keys.
// Dexie should only see the clean Metric shape, so strip it on save.
function stripFieldArrayIds(metrics: Activity['metrics']): Activity['metrics'] {
  const clean = (m: Metric): Metric => ({
    name: m.name,
    type: m.type,
    description: m.description,
  });
  return {
    primary: metrics.primary ? clean(metrics.primary) : null,
    secondary: metrics.secondary.map(clean),
    guardrails: metrics.guardrails.map(clean),
    businessSignificanceThreshold: metrics.businessSignificanceThreshold,
  };
}
