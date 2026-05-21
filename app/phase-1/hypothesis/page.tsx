'use client';

import { useCurrentActivity } from '@/lib/storage';
import { HypothesisForm } from '@/components/hypothesis-form';
import { PageHeader } from '@/components/page-header';

export default function HypothesisPage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 1 — Plan · Step 2 of 7"
        title="Hypothesis & Metrics"
        description="Five short fields compose a testable statement. Pick the metrics that'll prove or disprove it."
      />
      {activity ? (
        <HypothesisForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
