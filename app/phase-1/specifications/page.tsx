'use client';

import { useCurrentActivity } from '@/lib/storage';
import { SpecificationsForm } from '@/components/specifications-form';
import { PageHeader } from '@/components/page-header';

export default function SpecificationsPage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 1 — Plan · Step 8 of 8"
        title="Generate Specifications"
        description="Produce a one-page PDF spec from everything captured in Phase 1. Useful for sharing with approvers, archiving, or attaching to the activity in Adobe Target."
      />
      {activity ? (
        <SpecificationsForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
