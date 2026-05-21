'use client';

import { useCurrentActivity } from '@/lib/storage';
import { AudienceForm } from '@/components/audience-form';
import { PageHeader } from '@/components/page-header';

export default function AudiencePage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 1 — Plan · Step 3 of 7"
        title="Audience & Targeting"
        description="Define who the activity is for and how Adobe Target will qualify them. Reducing audience noise here is the cheapest way to keep your data clean."
      />
      {activity ? (
        <AudienceForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
