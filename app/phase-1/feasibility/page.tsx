'use client';

import { useCurrentActivity } from '@/lib/storage';
import { FeasibilityForm } from '@/components/feasibility-form';
import { PageHeader } from '@/components/page-header';

export default function FeasibilityPage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 1 — Plan · Step 4 of 7"
        title="Technical Feasibility"
        description="Confirm the change is doable inside Adobe Target and won't surprise you at launch. Method choice, DOM stability, integrations, and known risks."
      />
      {activity ? (
        <FeasibilityForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
