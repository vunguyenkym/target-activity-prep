'use client';

import { useCurrentActivity } from '@/lib/storage';
import { LaunchForm } from '@/components/launch-form';
import { PageHeader } from '@/components/page-header';

export default function LaunchPage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 2 — Launch"
        title="Launch Checklist"
        description="Day-of-launch and first-week disciplines — variant targeting, traffic split, mid-test QA, and the stakeholder cadence that catches problems early."
      />
      {activity ? (
        <LaunchForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
