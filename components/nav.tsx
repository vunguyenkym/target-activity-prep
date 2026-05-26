'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  ArrowDownToLine,
  BookOpen,
  ClipboardList,
  Compass,
  FlaskConical,
  Footprints,
  Layers,
  LineChart,
  Rocket,
  Scale,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { AdobeLogo } from '@/components/adobe-logo';
import { Phase1Progress } from '@/components/phase-1-progress';
import {
  isSectionComplete,
  useCurrentActivity,
  type SectionId,
} from '@/lib/storage';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  sectionId?: SectionId;
  icon?: LucideIcon;
  // Signals the section produces a downloadable artefact (a PDF). Renders
  // a small download badge after the label so users can spot the
  // download-bearing steps at a glance.
  downloadable?: boolean;
};

type NavGroup = {
  label?: string;
  icon?: LucideIcon;
  items: NavItem[];
};

type NavSection = {
  title: string;
  icon: LucideIcon;
  groups: NavGroup[];
};

const SECTIONS: NavSection[] = [
  {
    title: 'Activity Planning',
    icon: ClipboardList,
    groups: [
      {
        label: 'Phase 1 — Plan',
        icon: Compass,
        items: [
          {
            href: '/phase-1/overview',
            label: 'Activity Overview',
            sectionId: 'overview',
          },
          {
            href: '/phase-1/hypothesis',
            label: 'Hypothesis & Metrics',
            sectionId: 'hypothesis',
          },
          {
            href: '/phase-1/audience',
            label: 'Audience & Targeting',
            sectionId: 'audience',
          },
          {
            href: '/phase-1/feasibility',
            label: 'Technical Feasibility',
            sectionId: 'feasibility',
          },
          {
            href: '/phase-1/comparison',
            label: 'Experience Comparison',
            sectionId: 'comparison',
          },
          {
            href: '/phase-1/sample-size',
            label: 'Sample Size & Duration',
            sectionId: 'sample-size',
          },
          { href: '/phase-1/qa', label: 'QA Checklist', sectionId: 'qa' },
          {
            href: '/phase-1/specifications',
            label: 'Generate Specifications',
            sectionId: 'specifications',
            downloadable: true,
          },
        ],
      },
      {
        label: 'Phase 2 — Launch',
        icon: Rocket,
        items: [
          {
            href: '/phase-2/launch',
            label: 'Launch Checklist',
            sectionId: 'launch',
          },
        ],
      },
      {
        label: 'Phase 3 — Evaluate',
        icon: LineChart,
        items: [
          {
            href: '/phase-3/evaluation',
            label: 'Evaluation Guide',
            sectionId: 'evaluation',
          },
          {
            href: '/phase-3/value-realisation',
            label: 'Value Realisation',
            sectionId: 'value-realisation',
          },
          {
            href: '/phase-3/archive',
            label: 'Insights & Archive',
            sectionId: 'archive',
            downloadable: true,
          },
        ],
      },
    ],
  },
  {
    title: 'Knowledge',
    icon: BookOpen,
    groups: [
      {
        items: [
          {
            href: '/knowledge/setup-walkthrough',
            label: 'Setup Walk-through',
            icon: Footprints,
          },
          {
            href: '/knowledge/activity-types',
            label: 'Adobe Target Activity Types',
            icon: Layers,
          },
          {
            href: '/knowledge/methodology',
            label: 'Testing Methodology',
            icon: FlaskConical,
          },
          {
            href: '/knowledge/pitfalls',
            label: 'Common Pitfalls',
            icon: AlertTriangle,
          },
          {
            href: '/knowledge/roles-cadence',
            label: 'Roles & Cadence',
            icon: UsersRound,
          },
          {
            href: '/knowledge/prioritization',
            label: 'Prioritization Framework',
            icon: Scale,
          },
        ],
      },
    ],
  },
];

export function Nav() {
  const activity = useCurrentActivity();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 flex h-screen w-72 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-6 text-sidebar-foreground">
      <Link href="/home" className="flex items-center gap-2.5">
        <AdobeLogo className="size-8 shrink-0 rounded-lg shadow-lg shadow-[#FA0F00]/25" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">
            Adobe Target Activity Prep
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/55">
            Pre-launch workspace
          </span>
        </div>
      </Link>

      <Phase1Progress activity={activity} />

      <div className="flex flex-col gap-7 overflow-y-auto">
        {SECTIONS.map((section, sectionIdx) => (
          <div key={section.title} className="space-y-3">
            {sectionIdx > 0 && (
              <div aria-hidden className="border-t border-sidebar-border/60" />
            )}
            <div className="flex items-center gap-2 px-1">
              <section.icon
                className="size-3.5 text-sidebar-primary"
                strokeWidth={2}
                aria-hidden
              />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/85">
                {section.title}
              </span>
            </div>

            <div className="space-y-4">
              {section.groups.map((group, groupIdx) => (
                <div key={group.label ?? `g-${groupIdx}`}>
                  {group.label && (
                    <div className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
                      {group.icon && (
                        <group.icon
                          className="size-3"
                          strokeWidth={2}
                          aria-hidden
                        />
                      )}
                      {group.label}
                    </div>
                  )}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = pathname === item.href;
                      const trackable = item.sectionId !== undefined;
                      const complete = trackable
                        ? isSectionComplete(activity, item.sectionId!)
                        : false;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all',
                              active
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                            )}
                          >
                            {active && (
                              <span
                                aria-hidden
                                className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-sidebar-primary"
                              />
                            )}
                            {trackable ? (
                              <span
                                aria-label={
                                  complete ? 'complete' : 'incomplete'
                                }
                                className={cn(
                                  'inline-block size-2 shrink-0 rounded-full transition-colors',
                                  complete
                                    ? 'bg-sidebar-primary shadow-[0_0_0_3px_oklch(0.65_0.22_268/0.18)]'
                                    : 'border border-sidebar-foreground/35',
                                )}
                              />
                            ) : item.icon ? (
                              <item.icon
                                className="size-3.5 shrink-0 text-sidebar-foreground/60"
                                strokeWidth={2}
                                aria-hidden
                              />
                            ) : null}
                            <span className="truncate">{item.label}</span>
                            {item.downloadable && (
                              <span
                                aria-label="Includes a downloadable PDF"
                                title="Includes a downloadable PDF"
                                className={cn(
                                  // Teal — chosen for legibility on the dark
                                  // sidebar where the previous Adobe red
                                  // dropped into the background.
                                  'ml-auto inline-flex size-4 shrink-0 items-center justify-center rounded text-[#2dd4bf]',
                                  'bg-[#14b8a6]/20 ring-1 ring-[#2dd4bf]/50',
                                )}
                              >
                                <ArrowDownToLine
                                  className="size-2.5"
                                  strokeWidth={2.25}
                                  aria-hidden
                                />
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
