'use client';

import { useCurrentActivity } from '@/lib/storage';
import { OverviewForm } from '@/components/overview-form';
import { PageHeader } from '@/components/page-header';

export default function OverviewPage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 1 — Plan · Step 1 of 7"
        title="Activity Overview"
        description="High-level facts about this activity. Only the name is required for this section to count as complete."
      />
      {activity ? (
        <OverviewForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
