'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Compass,
  FlaskConical,
  Footprints,
  Hammer,
  Info,
  Layers,
  LineChart,
  Lock,
  Rocket,
  Scale,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import {
  isSectionComplete,
  useCurrentActivity,
  type Activity,
  type SectionId,
} from '@/lib/storage';
import { cn } from '@/lib/utils';

// All step + topic config is local to this page so /home stays self-
// contained. The nav already encodes the same routes; we deliberately
// duplicate the surface here so the home page can describe each step in
// its own voice without coupling to the sidebar's terse labels.

type Step = {
  href: string;
  label: string;
  sectionId: SectionId;
  description: string;
  // Section produces a downloadable PDF artefact.
  downloadable?: boolean;
};

type Phase = {
  title: string;
  icon: LucideIcon;
  description: string;
  steps: Step[];
};

const PHASES: Phase[] = [
  {
    title: 'Phase 1 — Plan',
    icon: Compass,
    description:
      'Shape the hypothesis, the audience, and a credible sample-size check.',
    steps: [
      {
        href: '/phase-1/overview',
        sectionId: 'overview',
        label: 'Activity Overview',
        description: 'Name the activity and set the stage.',
      },
      {
        href: '/phase-1/hypothesis',
        sectionId: 'hypothesis',
        label: 'Hypothesis & Metrics',
        description: 'Write the change you expect and how you’ll measure it.',
      },
      {
        href: '/phase-1/audience',
        sectionId: 'audience',
        label: 'Audience & Targeting',
        description: 'Choose who sees the test and who is excluded.',
      },
      {
        href: '/phase-1/feasibility',
        sectionId: 'feasibility',
        label: 'Technical Feasibility',
        description: 'Implementation method, tracking, and integrations.',
      },
      {
        href: '/phase-1/comparison',
        sectionId: 'comparison',
        label: 'Experience Comparison',
        description: 'Document the control and each variant.',
      },
      {
        href: '/phase-1/sample-size',
        sectionId: 'sample-size',
        label: 'Sample Size & Duration',
        description: 'Calculate how long the test needs to run.',
      },
      {
        href: '/phase-1/qa',
        sectionId: 'qa',
        label: 'QA Checklist',
        description: 'Verify the test is ready to ship.',
      },
      {
        href: '/phase-1/specifications',
        sectionId: 'specifications',
        label: 'Generate Specifications',
        description: 'Export a clean specs PDF for review.',
        downloadable: true,
      },
    ],
  },
  {
    title: 'Phase 2 — Launch',
    icon: Rocket,
    description: 'Walk the launch-day checklist so nothing goes live unverified.',
    steps: [
      {
        href: '/phase-2/launch',
        sectionId: 'launch',
        label: 'Launch Checklist',
        description: 'Pre-launch sign-offs and the go-live record.',
      },
    ],
  },
  {
    title: 'Phase 3 — Evaluate',
    icon: LineChart,
    description:
      'Read the result, calculate value realised, archive what you learned.',
    steps: [
      {
        href: '/phase-3/evaluation',
        sectionId: 'evaluation',
        label: 'Evaluation Guide',
        description: 'Outcome, observed lift, recommended next step.',
      },
      {
        href: '/phase-3/value-realisation',
        sectionId: 'value-realisation',
        label: 'Value Realisation',
        description: 'Convert lift to dollars: A × B × C = D.',
      },
      {
        href: '/phase-3/archive',
        sectionId: 'archive',
        label: 'Insights & Archive',
        description: 'Capture findings, download the summary PDF.',
        downloadable: true,
      },
    ],
  },
];

const KNOWLEDGE_TOPICS: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    href: '/knowledge/setup-walkthrough',
    label: 'Setup Walk-through',
    description:
      'Interactive A-to-Z guide for creating a Target activity. Works for A/B, Auto-Target, and XT.',
    icon: Footprints,
  },
  {
    href: '/knowledge/activity-types',
    label: 'Adobe Target Activity Types',
    description:
      'A/B, MVT, XT, Auto-Personalisation, Recommendations — what each is for.',
    icon: Layers,
  },
  {
    href: '/knowledge/methodology',
    label: 'Testing Methodology',
    description:
      'Statistical rigour, MDE, business significance, traffic and duration.',
    icon: FlaskConical,
  },
  {
    href: '/knowledge/pitfalls',
    label: 'Common Pitfalls',
    description:
      'Audience contamination, peeking, novelty effects, false positives.',
    icon: AlertTriangle,
  },
  {
    href: '/knowledge/roles-cadence',
    label: 'Roles & Cadence',
    description:
      'Who owns what across plan-launch-evaluate, and at what tempo.',
    icon: UsersRound,
  },
  {
    href: '/knowledge/prioritization',
    label: 'Prioritization Framework',
    description:
      'Score and rank ideas so the highest-leverage activities run first.',
    icon: Scale,
  },
];

function nextStepForPhase(
  activity: Activity | undefined,
  phase: Phase,
): Step | null {
  return (
    phase.steps.find((s) => !isSectionComplete(activity, s.sectionId)) ?? null
  );
}

function nextStepOverall(
  activity: Activity | undefined,
): { phase: Phase; step: Step } | null {
  for (const phase of PHASES) {
    const step = nextStepForPhase(activity, phase);
    if (step) return { phase, step };
  }
  return null;
}

export default function HomePage() {
  const activity = useCurrentActivity();
  const allSteps = PHASES.flatMap((p) => p.steps);
  const total = allSteps.length;
  const completed = allSteps.filter((s) =>
    isSectionComplete(activity, s.sectionId),
  ).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const next = nextStepOverall(activity);
  const firstStep = PHASES[0]?.steps[0] ?? null;
  const ctaTarget = next ?? (firstStep && { phase: PHASES[0], step: firstStep });
  const ctaLabel = next ? `Continue with ${next.step.label}` : 'Start planning';

  return (
    <div className="space-y-14">
      <section className="space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Welcome
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Prep an Adobe Target activity from idea to archive
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A guided workflow for shaping a hypothesis, sizing it, launching it,
          and recording what it was worth. Saved as you go — pick up where
          you left off, or start somewhere new.
        </p>
        {ctaTarget && (
          <div className="pt-2">
            <Link
              href={ctaTarget.step.href}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Your progress
          </div>
          <div className="text-xs tabular-nums text-muted-foreground">
            {completed} / {total} steps complete · {pct}%
          </div>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PHASES.map((phase) => {
            const done = phase.steps.filter((s) =>
              isSectionComplete(activity, s.sectionId),
            ).length;
            const totalSteps = phase.steps.length;
            const phasePct = Math.round((done / totalSteps) * 100);
            return (
              <div
                key={phase.title}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <phase.icon
                    className="size-3.5 text-primary"
                    strokeWidth={2}
                  />
                  {phase.title}
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-2xl font-semibold tabular-nums text-foreground">
                    {phasePct}%
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">
                    {done} / {totalSteps}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <ClipboardList className="size-3.5" strokeWidth={2} />
            Activity Planning
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Walk the activity step by step
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Each step opens a focused workspace with prompts, examples, and a
            running completion check. There’s nothing to submit — your work
            is saved locally as you type.
          </p>
        </div>
        <div className="space-y-7">
          {PHASES.map((phase) => (
            <div key={phase.title} className="space-y-3">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <phase.icon
                  className="size-4 self-center text-primary"
                  strokeWidth={2}
                />
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                  {phase.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {phase.description}
                </p>
              </div>
              <ul className="grid gap-2 md:grid-cols-2">
                {phase.steps.map((step, idx) => {
                  const done = isSectionComplete(activity, step.sectionId);
                  return (
                    <li key={step.href}>
                      <Link
                        href={step.href}
                        className="group flex h-full items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums',
                            done
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border bg-background text-muted-foreground',
                          )}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <p className="truncate text-sm font-medium text-foreground">
                                {step.label}
                              </p>
                              {step.downloadable && (
                                <span
                                  aria-label="Includes a downloadable PDF"
                                  title="Includes a downloadable PDF"
                                  // Teal — same treatment as the sidebar
                                  // badge, but on the light tile we lean on
                                  // a deeper teal for ink so it still pops.
                                  className="inline-flex size-4 shrink-0 items-center justify-center rounded bg-[#14b8a6]/15 text-[#0d9488] ring-1 ring-[#14b8a6]/40"
                                >
                                  <ArrowDownToLine
                                    className="size-2.5"
                                    strokeWidth={2.25}
                                    aria-hidden
                                  />
                                </span>
                              )}
                            </div>
                            <ArrowRight
                              className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                              aria-hidden
                            />
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <BookOpen className="size-3.5" strokeWidth={2} />
            Knowledge
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Reference for the harder calls
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Short reads on activity types, methodology, common pitfalls, and
            how to prioritise so the highest-leverage tests run first.
          </p>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {KNOWLEDGE_TOPICS.map((topic) => (
            <li key={topic.href}>
              <Link
                href={topic.href}
                className="group flex h-full items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary ring-1 ring-primary/15">
                  <topic.icon className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {topic.label}
                    </p>
                    <ArrowRight
                      className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {topic.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-label="Disclaimer"
        className="rounded-xl border border-border bg-muted/30 p-5"
      >
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Info className="size-3.5" strokeWidth={2} aria-hidden />
          A few honest notes
        </div>
        <ul className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <AlertTriangle
              className="mt-0.5 size-3.5 shrink-0 text-amber-600"
              strokeWidth={2}
              aria-hidden
            />
            <span>
              <span className="font-semibold text-foreground">
                Unofficial Adobe tool.
              </span>{' '}
              This project is not affiliated with, endorsed by, or sponsored
              by Adobe Inc. “Adobe” and “Adobe Target” are trademarks of
              Adobe Inc.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Hammer
              className="mt-0.5 size-3.5 shrink-0 text-sky-600"
              strokeWidth={2}
              aria-hidden
            />
            <span>
              <span className="font-semibold text-foreground">
                Project in development.
              </span>{' '}
              Features, copy, and data model are evolving — things may
              change without notice. Treat outputs as drafts, not
              gospel.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Lock
              className="mt-0.5 size-3.5 shrink-0 text-emerald-600"
              strokeWidth={2}
              aria-hidden
            />
            <span>
              <span className="font-semibold text-foreground">
                Privacy &amp; data.
              </span>{' '}
              All your data — activity inputs, screenshot uploads, and any
              feedback you submit via the floating Feedback button — lives
              only in your browser&rsquo;s IndexedDB. No accounts, no
              analytics, no servers (yet — feedback delivery is on the
              roadmap and we&rsquo;ll update this note when it ships).
              Clear your data via the <em>Clear data</em> button on the
              Activity Overview, or via your browser&rsquo;s site
              settings.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
