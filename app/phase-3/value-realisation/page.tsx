'use client';

import { useCurrentActivity } from '@/lib/storage';
import { ValueRealisationForm } from '@/components/value-realisation-form';
import { PageHeader } from '@/components/page-header';

export default function ValueRealisationPage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 3 — Evaluate"
        title="Value Realisation"
        description="Turn the test result into a dollar impact. Driver × performance change × financial valuation = annualised business impact, per the Adobe value framework."
      />
      {activity ? (
        <ValueRealisationForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
