'use client';

import { useCurrentActivity } from '@/lib/storage';
import { ArchiveForm } from '@/components/archive-form';
import { PageHeader } from '@/components/page-header';

export default function ArchivePage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 3 — Evaluate"
        title="Insights & Archive"
        description="Bank the learning. A read-only snapshot of the activity, lessons for the next person, and the toggle that marks this one officially closed."
      />
      {activity ? (
        <ArchiveForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
