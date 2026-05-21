'use client';

import { useCurrentActivity } from '@/lib/storage';
import { QaForm } from '@/components/qa-form';
import { PageHeader } from '@/components/page-header';

export default function QaPage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 1 — Plan · Step 7 of 8"
        title="QA Checklist"
        description="Pre-launch checks that catch flawed data collection or broken variants before the experiment goes live."
      />
      {activity ? (
        <QaForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
