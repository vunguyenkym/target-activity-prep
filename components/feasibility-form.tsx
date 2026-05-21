'use client';

import { Controller, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/toggle';
import { ExperienceLeagueLink } from '@/components/knowledge-card';
import {
  saveActivity,
  type Activity,
  type DomStability,
  type ImplementationMethod,
  type IntegrationId,
} from '@/lib/storage';

type FeasibilityValues = Activity['feasibility'];

const IMPLEMENTATION_OPTIONS: { id: ImplementationMethod; label: string }[] = [
  { id: 'vec', label: 'Visual Experience Composer (VEC)' },
  { id: 'form-based', label: 'Form-based composer' },
  { id: 'custom-code', label: 'Custom code' },
  { id: 'recommendations', label: 'Recommendations' },
];

const DOM_OPTIONS: { id: DomStability; label: string; helper: string }[] = [
  {
    id: 'low',
    label: 'Low risk',
    helper: 'Stable markup; selectors unlikely to shift between deploys.',
  },
  {
    id: 'medium',
    label: 'Medium risk',
    helper: 'Some moving parts — JS framework, A/B-managed elements.',
  },
  {
    id: 'high',
    label: 'High risk',
    helper: 'Frequent layout changes, dynamic IDs, heavy SPA rerenders.',
  },
];

const INTEGRATION_OPTIONS: { id: IntegrationId; label: string }[] = [
  { id: 'a4t', label: 'Analytics (A4T)' },
  { id: 'aam', label: 'Audience Manager (AAM)' },
  { id: 'cdp', label: 'Real-Time CDP' },
  { id: 'aem', label: 'Experience Manager (AEM)' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'ajo', label: 'Journey Optimizer (AJO)' },
  { id: 'other', label: 'Other' },
];

export function FeasibilityForm({ activity }: { activity: Activity }) {
  const form = useForm<FeasibilityValues>({
    defaultValues: activity.feasibility,
  });

  const persist = async () => {
    await saveActivity({ ...activity, feasibility: form.getValues() });
  };

  const trackingValidated = form.watch('trackingValidated');
  const integrations = form.watch('integrations') ?? [];

  const toggleIntegration = (id: IntegrationId, next: boolean) => {
    const current = form.getValues('integrations') ?? [];
    const updated = next
      ? Array.from(new Set([...current, id]))
      : current.filter((i) => i !== id);
    form.setValue('integrations', updated, { shouldDirty: true });
    void persist();
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-1.5">
        <Label htmlFor="implementationMethod">Implementation method</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          How will the activity be built inside Adobe Target? VEC for visual swaps,
          form-based for non-visual or email contexts, custom code for anything
          beyond simple DOM changes.
        </p>
        <Controller
          control={form.control}
          name="implementationMethod"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => {
                if (typeof v !== 'string') return;
                field.onChange(v as ImplementationMethod);
                void persist();
              }}
            >
              <SelectTrigger id="implementationMethod" className="w-72">
                <SelectValue placeholder="Choose a method">
                  {(v: unknown) =>
                    typeof v === 'string' && v
                      ? IMPLEMENTATION_OPTIONS.find((o) => o.id === v)?.label
                      : null
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {IMPLEMENTATION_OPTIONS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="domStability">DOM stability risk</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          How fragile is the page&apos;s markup? High-risk pages tend to break
          VEC selectors silently — bias toward form-based or custom code in
          that case.
        </p>
        <Controller
          control={form.control}
          name="domStability"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => {
                if (typeof v !== 'string') return;
                field.onChange(v as DomStability);
                void persist();
              }}
            >
              <SelectTrigger id="domStability" className="w-72">
                <SelectValue placeholder="Choose a level">
                  {(v: unknown) =>
                    typeof v === 'string' && v
                      ? DOM_OPTIONS.find((o) => o.id === v)?.label
                      : null
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DOM_OPTIONS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Required integrations</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          Tick anything this activity depends on outside Adobe Target. Mismatches
          here are a common source of last-minute launch blockers.
        </p>
        <div className="flex flex-wrap gap-2">
          {INTEGRATION_OPTIONS.map((opt) => {
            const checked = integrations.includes(opt.id);
            return (
              <Toggle
                key={opt.id}
                checked={checked}
                onChange={(next) => toggleIntegration(opt.id, next)}
              >
                {opt.label}
              </Toggle>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tracking &amp; tags</Label>
        <Toggle
          checked={trackingValidated}
          onChange={(next) => {
            form.setValue('trackingValidated', next, { shouldDirty: true });
            void persist();
          }}
        >
          Tracking and tags validated in place
        </Toggle>
        <p className="text-xs text-muted-foreground">
          Required tags fire on the test page, profile parameters resolve,
          and analytics events are wired before the activity launches.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="blockersNotes">Blockers &amp; risk notes</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          Anything that could block launch or skew the result. Open IT
          dependencies, third-party scripts, performance budgets, compliance
          questions. Better here than discovered the day of launch.
        </p>
        <Textarea
          id="blockersNotes"
          rows={3}
          placeholder="Open dependency on data-team to expose `member_tier` in mbox params; pending."
          {...form.register('blockersNotes', { onBlur: persist })}
        />
      </div>

      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/audiences/visitor-profiles/profile-parameters" />
    </form>
  );
}
