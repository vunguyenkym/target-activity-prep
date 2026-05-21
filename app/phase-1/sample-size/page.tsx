'use client';

import { useCurrentActivity } from '@/lib/storage';
import { SampleSizeForm } from '@/components/sample-size-form';
import { PageHeader } from '@/components/page-header';

export default function SampleSizePage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 1 — Plan · Step 6 of 7"
        title="Sample Size & Duration"
        description="How many visitors and how many days will you need to call a winner? Tune the inputs to see what's feasible."
      />
      {activity ? (
        <SampleSizeForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
