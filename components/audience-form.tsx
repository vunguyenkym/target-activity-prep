'use client';

import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/toggle';
import { ExperienceLeagueLink } from '@/components/knowledge-card';
import { saveActivity, type Activity } from '@/lib/storage';

type AudienceValues = Activity['audience'];

export function AudienceForm({ activity }: { activity: Activity }) {
  const form = useForm<AudienceValues>({ defaultValues: activity.audience });

  const persist = async () => {
    await saveActivity({ ...activity, audience: form.getValues() });
  };

  const segmentValidated = form.watch('segmentValidated');

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-1.5">
        <Label htmlFor="audienceDescription">Audience description</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          Who is this activity for? Describe the segment in plain English —
          behaviours, traits, lifecycle stage, traffic source, device. Be
          specific enough that someone could replicate the audience in Adobe Target.
        </p>
        <Textarea
          id="audienceDescription"
          rows={3}
          placeholder="Returning visitors on mobile who viewed the pricing page in the last 7 days"
          {...form.register('description', { onBlur: persist })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="targetingRules">Targeting rules</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          The page-targeting + audience-qualification logic the activity will
          use. Mention URL patterns, mbox parameters, profile scripts, or
          custom-event qualifications.
        </p>
        <Textarea
          id="targetingRules"
          rows={3}
          placeholder={
            'URL contains /pricing\nAudience qualifies on `loggedIn = true` and `cart_value > 0`'
          }
          {...form.register('targetingRules', { onBlur: persist })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="exclusionRules">Exclusion rules</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          Anyone explicitly excluded — employees, customers in concurrent
          activities, opted-out users, regulated regions. Leave blank if not
          applicable.
        </p>
        <Textarea
          id="exclusionRules"
          rows={2}
          placeholder="Internal staff (cookie `is_staff = true`), users currently in Activity #4291"
          {...form.register('exclusionRules', { onBlur: persist })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="splitNotes">Traffic split plan</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          Intended audience split across control and variants. Numbers and
          rationale, e.g., &quot;50/50 to keep statistical power; control
          unchanged.&quot; Final allocation is set inside Adobe Target.
        </p>
        <Input
          id="splitNotes"
          placeholder="50/50 (control / variant)"
          {...form.register('splitNotes', { onBlur: persist })}
        />
      </div>

      <div className="space-y-2">
        <Label>Segment availability</Label>
        <Toggle
          checked={segmentValidated}
          onChange={(next) => {
            form.setValue('segmentValidated', next, { shouldDirty: true });
            void persist();
          }}
        >
          Segment validated in Adobe Target
        </Toggle>
        <p className="text-xs text-muted-foreground">
          Confirm the audience exists and qualifies the expected visitors
          before launch — toggle on once verified.
        </p>
      </div>

      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/audiences/create-audiences/create-audience" />
    </form>
  );
}
