'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Lightbulb,
} from 'lucide-react';
import {
  ACTIVITY_TYPES,
  STEPS,
  type ActivityType,
} from '@/lib/setup-walkthrough-content';
import { STEP_DIAGRAMS } from '@/components/setup-walkthrough-diagrams';
import { cn } from '@/lib/utils';

export function SetupWalkthrough() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [type, setType] = useState<ActivityType>('ab');
  // Example visibility tracked per step so toggling one doesn't expose all.
  const [exampleShown, setExampleShown] = useState<Record<string, boolean>>({});
  // "Visited" only affects the stepper styling — purely a learning aid, not
  // tracked completion, so it resets with a page reload.
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));

  const step = STEPS[currentIdx];
  if (!step) return null;

  // Mark each step as visited when it becomes current.
  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(currentIdx)) return prev;
      const next = new Set(prev);
      next.add(currentIdx);
      return next;
    });
  }, [currentIdx]);

  // Keyboard nav. Ignore key presses while the user is typing in a field
  // (defensive — there are no inputs on the Knowledge surface today, but
  // the component might get reused elsewhere later).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        setCurrentIdx((i) => Math.min(STEPS.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIdx((i) => Math.max(0, i - 1));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const typeMeta = ACTIVITY_TYPES.find((t) => t.id === type);
  const typeNote = step.byType?.[type]?.note;
  const examples =
    step.example.byType?.[type] ?? step.example.universal ?? [];
  const showingExample = exampleShown[step.id] ?? false;
  const docsUrl = step.docs.byType?.[type] ?? step.docs.universal;
  const Diagram = STEP_DIAGRAMS[step.id];

  return (
    <div className="space-y-6">
      <section
        aria-label="Activity type"
        className="rounded-xl border border-border bg-card p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Activity type
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {typeMeta?.blurb}
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Activity type"
            className="inline-flex rounded-md border border-border bg-background p-0.5"
          >
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={type === t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-colors',
                  type === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/*
        Sticky stepper. Sits below the page header but anchors to the top
        of the scrolling viewport. Backdrop-blur keeps it legible while the
        body content scrolls underneath.
      */}
      <nav
        aria-label="Setup steps"
        className="sticky top-0 z-10 -mx-2 bg-background/90 px-2 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      >
        <ol className="flex items-center gap-1">
          {STEPS.map((s, i) => {
            const isCurrent = i === currentIdx;
            const isVisited = visited.has(i);
            return (
              <li key={s.id} className="flex flex-1 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentIdx(i)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className="group flex min-w-0 items-center gap-1.5 text-left"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold tabular-nums transition-all',
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/15'
                        : isVisited
                          ? 'bg-primary/80 text-primary-foreground'
                          : 'border border-border bg-card text-muted-foreground group-hover:border-primary/40',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      'hidden truncate text-[10px] font-semibold uppercase tracking-[0.14em] sm:inline',
                      isCurrent ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {s.shortLabel}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      'h-px flex-1',
                      i < currentIdx ? 'bg-primary/40' : 'bg-border',
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Key forces remount → tw-animate-css entry animation plays again. */}
      <article
        key={`${step.id}-${type}`}
        className="animate-in fade-in slide-in-from-right-2 duration-200 space-y-5"
      >
        <header className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Step {currentIdx + 1} of {STEPS.length}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {step.title}
          </h2>
          <p className="text-sm text-muted-foreground">{step.purpose}</p>
        </header>

        {Diagram && (
          <figure className="overflow-hidden rounded-lg border border-border bg-card">
            <Diagram />
            <figcaption className="border-t border-border bg-muted/40 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Schematic — not Adobe&apos;s UI
            </figcaption>
          </figure>
        )}

        <p className="text-sm leading-relaxed text-foreground">{step.body}</p>

        {typeNote && (
          <aside className="rounded-md border-l-2 border-primary bg-accent/40 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {typeMeta?.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {typeNote}
            </p>
          </aside>
        )}

        {step.inputs.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Inputs
            </p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {step.inputs.map((input) => (
                <li
                  key={input}
                  className="flex items-start gap-2 text-xs text-foreground"
                >
                  <ChevronRight
                    className="mt-0.5 size-3 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span>{input}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step.gotchas.length > 0 && (
          <div className="rounded-md border border-amber-200/70 bg-amber-50/60 p-3 dark:border-amber-500/30 dark:bg-amber-950/20">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-3" strokeWidth={2} aria-hidden />
              Gotchas
            </div>
            <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-foreground">
              {step.gotchas.map((g) => (
                <li key={g} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 size-1 shrink-0 rounded-full bg-amber-600"
                  />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setExampleShown((m) => ({ ...m, [step.id]: !showingExample }))
            }
            aria-expanded={showingExample}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <Lightbulb className="size-3.5" strokeWidth={2} aria-hidden />
            {showingExample ? 'Hide example' : 'Show example'}
          </button>
          {docsUrl && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <ExternalLink
                className="size-3.5"
                strokeWidth={2}
                aria-hidden
              />
              See in Adobe docs
            </a>
          )}
        </div>

        {showingExample && examples.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Example · Pricing-page CTA test
            </p>
            <dl className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {examples.map((ex) => (
                <div key={ex.label} className="space-y-0.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {ex.label}
                  </dt>
                  <dd className="text-xs leading-snug text-foreground">
                    {ex.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </article>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-card"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Previous
        </button>
        <div className="hidden items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:flex">
          <span>Use</span>
          <kbd className="rounded border border-border bg-muted px-1 text-[10px] font-medium">
            ←
          </kbd>
          <span>/</span>
          <kbd className="rounded border border-border bg-muted px-1 text-[10px] font-medium">
            →
          </kbd>
          <span>to navigate</span>
        </div>
        <button
          type="button"
          onClick={() =>
            setCurrentIdx((i) => Math.min(STEPS.length - 1, i + 1))
          }
          disabled={currentIdx === STEPS.length - 1}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
        >
          Next
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
