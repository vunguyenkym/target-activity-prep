'use client';

import { Controller, useForm } from 'react-hook-form';
import { Compass, Image as ImageIcon, ListChecks, Trophy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionLabel } from '@/components/section-label';
import { ScreenshotField } from '@/components/screenshot-field';
import { ExperienceLeagueLink } from '@/components/knowledge-card';
import {
  saveActivity,
  type Activity,
  type EvaluationOutcome,
} from '@/lib/storage';

type EvaluationValues = Activity['evaluation'];

const OUTCOME_OPTIONS: { id: Exclude<EvaluationOutcome, ''>; label: string }[] = [
  { id: 'won', label: 'Won — ship the variant' },
  { id: 'lost', label: 'Lost — keep the control' },
  { id: 'inconclusive', label: 'Inconclusive — no clear winner' },
];

const OUTCOME_LABEL: Record<Exclude<EvaluationOutcome, ''>, string> = {
  won: 'Won — ship the variant',
  lost: 'Lost — keep the control',
  inconclusive: 'Inconclusive — no clear winner',
};

export function EvaluationForm({ activity }: { activity: Activity }) {
  const form = useForm<EvaluationValues>({
    defaultValues: activity.evaluation,
  });

  const persist = async () => {
    const values = form.getValues();
    // Auto-sync VR.changePercent to observedLiftPercent — the actual lift
    // is what drives the realised value, not the planned MDE.
    const observedPct = Number(values.observedLiftPercent);
    const valueRealisation =
      Number.isFinite(observedPct) && observedPct !== 0
        ? {
            ...activity.valueRealisation,
            changePercent: Math.round(observedPct * 10) / 10,
          }
        : activity.valueRealisation;
    await saveActivity({
      ...activity,
      evaluation: values,
      valueRealisation,
    });
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <section className="space-y-4">
        <SectionLabel icon={Trophy} tone="primary">
          Result
        </SectionLabel>

        <div className="space-y-1.5">
          <Label htmlFor="outcome">Outcome</Label>
          <Controller
            control={form.control}
            name="outcome"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  if (typeof v !== 'string') return;
                  field.onChange(v as EvaluationOutcome);
                  void persist();
                }}
              >
                <SelectTrigger id="outcome" className="w-80">
                  <SelectValue placeholder="Pick the call">
                    {(v: unknown) =>
                      typeof v === 'string' && v
                        ? OUTCOME_LABEL[v as Exclude<EvaluationOutcome, ''>]
                        : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {OUTCOME_OPTIONS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="observedLiftPercent">Observed lift (%)</Label>
            <Input
              id="observedLiftPercent"
              type="number"
              inputMode="decimal"
              step="0.1"
              className="w-32"
              {...form.register('observedLiftPercent', {
                valueAsNumber: true,
                onBlur: persist,
              })}
            />
            <p className="text-xs text-muted-foreground">
              The actual lift on the primary metric. Auto-syncs to{' '}
              <span className="font-medium text-foreground">B</span> in Value
              Realisation when you save.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actualDays">Actual test duration (days)</Label>
            <Input
              id="actualDays"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className="w-32"
              {...form.register('actualDays', {
                valueAsNumber: true,
                onBlur: persist,
              })}
            />
            <p className="text-xs text-muted-foreground">
              How long the test actually ran. Shown alongside the planned
              duration in the Summary PDF.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confidenceLevel">Confidence at read (%)</Label>
            <Input
              id="confidenceLevel"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              className="w-32"
              {...form.register('confidenceLevel', {
                valueAsNumber: true,
                onBlur: persist,
              })}
            />
            <p className="text-xs text-muted-foreground">
              The confidence Adobe Target / Analytics reported when you
              called the result.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="observedLift">Observed lift — narrative</Label>
          <Input
            id="observedLift"
            placeholder="e.g., +4.2% on form completion (variant vs control), sustained over the run"
            {...form.register('observedLift', { onBlur: persist })}
          />
          <p className="text-xs text-muted-foreground">
            Plain-English description of what moved and on which metric.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionLabel icon={Compass}>Interpretation</SectionLabel>

        <div className="space-y-1.5">
          <Label htmlFor="businessImpact">Business / revenue impact</Label>
          <p className="max-w-xl text-xs text-muted-foreground">
            Annualised revenue proxy, incremental conversions, or whatever
            ties the lift back to the KBO. Numbers help here.
          </p>
          <Textarea
            id="businessImpact"
            rows={3}
            placeholder="At current traffic, +4.2% form completion = ~1,200 incremental leads/month, ~$X annualised pipeline."
            {...form.register('businessImpact', { onBlur: persist })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="significanceCall">
            Statistical vs business significance
          </Label>
          <p className="max-w-xl text-xs text-muted-foreground">
            Compare the observed lift against the business-significance
            threshold you set in Hypothesis &amp; Metrics. Is this a real win
            worth the engineering cost — or a small bump that doesn&apos;t
            justify rollout?
          </p>
          <Textarea
            id="significanceCall"
            rows={3}
            placeholder="Statistically significant at 96% confidence. Lift exceeds the +2% threshold we set, so worth shipping."
            {...form.register('significanceCall', { onBlur: persist })}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionLabel icon={ListChecks}>Next steps</SectionLabel>

        <div className="space-y-1.5">
          <Label htmlFor="technicalIssues">Technical issues encountered</Label>
          <p className="max-w-xl text-xs text-muted-foreground">
            Anything that went sideways during the run — DOM regressions,
            tracking gaps, audience contamination, traffic anomalies.
          </p>
          <Textarea
            id="technicalIssues"
            rows={3}
            placeholder="Variant rendered slowly on Safari iOS during week 2; suspected cache invalidation, didn't affect significance."
            {...form.register('technicalIssues', { onBlur: persist })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recommendedNextStep">Recommended next step</Label>
          <p className="max-w-xl text-xs text-muted-foreground">
            What happens now: ship to 100%, re-run with iteration, sunset the
            idea, or hold for a related decision. One sentence.
          </p>
          <Textarea
            id="recommendedNextStep"
            rows={2}
            placeholder="Ship the personalised hero to 100% next sprint; queue an iteration testing copy variants on the secondary CTA."
            {...form.register('recommendedNextStep', { onBlur: persist })}
          />
        </div>
      </section>

      <section className="space-y-2">
        <SectionLabel icon={ImageIcon}>
          Adobe Analytics dashboard (A4T)
        </SectionLabel>
        <p className="max-w-xl text-xs text-muted-foreground">
          Drop a screenshot of the Analytics-for-Target dashboard for this
          activity — the panel showing conversion, lift, and confidence. It
          shows up in the Activity Summary PDF and gives reviewers the
          underlying evidence at a glance.
        </p>
        <ScreenshotField
          label=""
          value={form.watch('a4tScreenshot') ?? ''}
          alt="A4T dashboard screenshot"
          onChange={(next) => {
            form.setValue('a4tScreenshot', next, { shouldDirty: true });
            void persist();
          }}
        />
      </section>

      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/reports/reports" />
    </form>
  );
}
