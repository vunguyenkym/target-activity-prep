'use client';

import { useCurrentActivity } from '@/lib/storage';
import { EvaluationForm } from '@/components/evaluation-form';
import { PageHeader } from '@/components/page-header';

export default function EvaluationPage() {
  const activity = useCurrentActivity();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 3 — Evaluate"
        title="Evaluation Guide"
        description="The experiment read-out. Outcome, what the lift actually means, anything that went sideways, and what happens next."
      />
      {activity ? (
        <EvaluationForm key={activity.id} activity={activity} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
