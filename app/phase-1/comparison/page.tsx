'use client';

import { useCurrentActivity } from '@/lib/storage';
import { ComparisonForm } from '@/components/comparison-form';
import { PageHeader } from '@/components/page-header';

export default function ComparisonPage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 1 — Plan · Step 5 of 7"
        title="Experience Comparison"
        description="Lay out the control and each variant side-by-side. Concrete descriptions of what changes — not aspirations — and the intended traffic split."
      />
      {activity ? (
        <ComparisonForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
