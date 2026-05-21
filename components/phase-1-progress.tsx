'use client';

import {
  isSectionComplete,
  type Activity,
  type SectionId,
} from '@/lib/storage';

const PHASE_1_SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'hypothesis', label: 'Hypothesis' },
  { id: 'audience', label: 'Audience' },
  { id: 'feasibility', label: 'Feasibility' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'sample-size', label: 'Sample size' },
  { id: 'qa', label: 'QA' },
];

export function Phase1Progress({ activity }: { activity: Activity | undefined }) {
  const total = PHASE_1_SECTIONS.length;
  const done = PHASE_1_SECTIONS.filter((s) =>
    isSectionComplete(activity, s.id),
  ).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const isComplete = done === total;

  return (
    <div className="-mx-6 border-y border-sidebar-border/70 bg-sidebar-accent/30 px-6 py-3">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/65">
        <span>Phase 1 progress</span>
        <span className="tabular-nums text-sidebar-foreground">
          {done} / {total}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sidebar-foreground/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sidebar-primary to-[oklch(0.65_0.22_320)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-sidebar-foreground/55">
        {isComplete ? (
          <span className="text-sidebar-foreground/85">
            Ready to generate specifications.
          </span>
        ) : (
          <>
            {pct}% complete — finish all 7 planning steps through QA before
            launch.
          </>
        )}
      </p>
    </div>
  );
}
