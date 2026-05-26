// Schematic diagrams for the Setup Walk-through.
//
// These are deliberately abstract — they convey the mental model of each
// step (e.g., "Targeting = three config cards", "QA = URL with token")
// without reproducing Adobe's UI. Pure in-app illustration, no Adobe
// imagery, no copyright concerns.
//
// All diagrams share the same 600×220 viewBox and a restrained palette
// (slate-100 fills, slate-300 borders, Adobe red accent for whatever the
// step is teaching). preserveAspectRatio defaults to xMidYMid meet so
// they scale cleanly inside a max-width container.

import type { ReactElement, ReactNode } from 'react';

const ACCENT = '#FA0F00';
const TEAL = '#0d9488';
const INK = '#0a0a0a';
const MUTED = '#737373';
const RULE = '#d4d4d8';
const SURFACE = '#fafafa';
const SURFACE_TINT = '#f4f4f5';

type DiagramProps = {
  className?: string;
};

function Frame({
  children,
  className,
  label,
}: {
  // Diagrams pass arrays of SVG elements, fragments, conditionals — use
  // ReactNode so TS accepts the whole zoo.
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 600 220"
      className={className ?? 'h-auto w-full'}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect
        x="0.5"
        y="0.5"
        width="599"
        height="219"
        rx="8"
        ry="8"
        fill="#ffffff"
        stroke={RULE}
      />
      {children}
    </svg>
  );
}

function CreateDiagram({ className }: DiagramProps) {
  // Three activity-type cards in a row, first selected. Below them: two
  // narrow dropdowns (composer, workspace) and a URL input bar.
  const cards: { label: string; selected: boolean }[] = [
    { label: 'A/B Test', selected: true },
    { label: 'Auto-Target', selected: false },
    { label: 'XT', selected: false },
  ];
  return (
    <Frame label="Create activity — pick type, composer, workspace, URL" className={className}>
      <text
        x="24"
        y="34"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.2"
        fill={MUTED}
      >
        ACTIVITY TYPE
      </text>
      {cards.map((c, i) => {
        const x = 24 + i * 184;
        return (
          <g key={c.label}>
            <rect
              x={x}
              y={48}
              width="170"
              height="46"
              rx="6"
              ry="6"
              fill={c.selected ? '#fef0ee' : SURFACE}
              stroke={c.selected ? ACCENT : RULE}
              strokeWidth={c.selected ? 1.4 : 1}
            />
            <circle
              cx={x + 14}
              cy={71}
              r="5"
              fill={c.selected ? ACCENT : '#ffffff'}
              stroke={c.selected ? ACCENT : RULE}
            />
            {c.selected && (
              <circle cx={x + 14} cy={71} r="2" fill="#ffffff" />
            )}
            <text
              x={x + 30}
              y={75}
              fontSize="13"
              fontWeight={c.selected ? 600 : 500}
              fill={INK}
            >
              {c.label}
            </text>
          </g>
        );
      })}
      <text
        x="24"
        y="128"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.2"
        fill={MUTED}
      >
        COMPOSER
      </text>
      <rect x="24" y="138" width="180" height="32" rx="4" fill={SURFACE} stroke={RULE} />
      <text x="36" y="158" fontSize="12" fill={INK}>
        Visual Experience Composer
      </text>
      <text
        x="220"
        y="128"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.2"
        fill={MUTED}
      >
        WORKSPACE
      </text>
      <rect x="220" y="138" width="140" height="32" rx="4" fill={SURFACE} stroke={RULE} />
      <text x="232" y="158" fontSize="12" fill={INK}>
        Growth Marketing
      </text>
      <text
        x="376"
        y="128"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.2"
        fill={MUTED}
      >
        ACTIVITY URL
      </text>
      <rect x="376" y="138" width="200" height="32" rx="4" fill={SURFACE} stroke={RULE} />
      <text x="388" y="158" fontSize="12" fill={INK}>
        shop.example.com/pricing
      </text>
    </Frame>
  );
}

function NameDiagram({ className }: DiagramProps) {
  // Mock breadcrumb header transforming Untitled → real name.
  return (
    <Frame label="Name the activity" className={className}>
      <text x="24" y="34" fontSize="10" fontWeight="600" letterSpacing="1.2" fill={MUTED}>
        ACTIVITY HEADER
      </text>

      {/* "Before" row */}
      <text x="24" y="64" fontSize="11" fill={MUTED}>
        Before
      </text>
      <rect x="24" y="74" width="552" height="40" rx="6" fill={SURFACE} stroke={RULE} />
      <text x="40" y="100" fontSize="13" fill={MUTED}>
        Activities  /  Untitled Activity
      </text>
      <g transform="translate(540, 88)">
        <rect x="0" y="0" width="22" height="22" rx="3" fill="#ffffff" stroke={RULE} />
        <path
          d="M5 16 L10 16 L17 9 L13 5 L6 12 Z"
          fill="none"
          stroke={MUTED}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </g>

      {/* "After" row */}
      <text x="24" y="142" fontSize="11" fill={MUTED}>
        After
      </text>
      <rect
        x="24"
        y="152"
        width="552"
        height="44"
        rx="6"
        fill="#fef0ee"
        stroke={ACCENT}
        strokeWidth="1.4"
      />
      <text x="40" y="180" fontSize="14" fontWeight="600" fill={INK}>
        Activities  /  2026Q2 — Pricing Page Hero CTA Test
      </text>
    </Frame>
  );
}

function ExperiencesDiagram({ className }: DiagramProps) {
  // Left rail: A / B / C experience tabs (B highlighted as "current"). Right:
  // two stacked mini-pages showing different hero CTAs.
  const tabs = [
    { id: 'A', label: 'Control', selected: false },
    { id: 'B', label: 'Variant B', selected: true },
    { id: 'C', label: 'Variant C', selected: false },
  ];
  return (
    <Frame label="Create experiences A / B / C" className={className}>
      <text x="24" y="34" fontSize="10" fontWeight="600" letterSpacing="1.2" fill={MUTED}>
        EXPERIENCES
      </text>
      {tabs.map((t, i) => {
        const y = 50 + i * 50;
        return (
          <g key={t.id}>
            <rect
              x="24"
              y={y}
              width="150"
              height="40"
              rx="5"
              fill={t.selected ? '#fef0ee' : SURFACE}
              stroke={t.selected ? ACCENT : RULE}
              strokeWidth={t.selected ? 1.4 : 1}
            />
            <circle cx="44" cy={y + 20} r="11" fill={t.selected ? ACCENT : '#ffffff'} stroke={t.selected ? ACCENT : RULE} />
            <text
              x="44"
              y={y + 24}
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              fill={t.selected ? '#ffffff' : INK}
            >
              {t.id}
            </text>
            <text x="64" y={y + 25} fontSize="13" fill={INK}>
              {t.label}
            </text>
          </g>
        );
      })}

      {/* Mock page canvas */}
      <rect x="200" y="50" width="376" height="140" rx="6" fill={SURFACE} stroke={RULE} />
      {/* Header strip */}
      <rect x="208" y="58" width="360" height="14" rx="2" fill={SURFACE_TINT} />
      {/* Hero area */}
      <rect x="208" y="80" width="220" height="60" rx="3" fill={SURFACE_TINT} />
      <text x="218" y="100" fontSize="11" fill={MUTED}>
        Hero copy
      </text>
      <text x="218" y="118" fontSize="11" fontWeight="600" fill={INK}>
        “Start 14-day trial”
      </text>
      {/* CTA */}
      <rect x="218" y="124" width="86" height="12" rx="2" fill={ACCENT} />
      {/* Side card */}
      <rect x="440" y="80" width="128" height="60" rx="3" fill="#ffffff" stroke={RULE} />
      <rect x="448" y="88" width="80" height="6" rx="1" fill={MUTED} />
      <rect x="448" y="100" width="100" height="4" rx="1" fill={RULE} />
      <rect x="448" y="108" width="92" height="4" rx="1" fill={RULE} />
      <rect x="448" y="116" width="60" height="10" rx="1" fill={ACCENT} opacity="0.4" />

      <text x="208" y="180" fontSize="11" fontWeight="600" fill={MUTED}>
        VEC CANVAS · live preview of variant B
      </text>
    </Frame>
  );
}

function TargetingDiagram({ className }: DiagramProps) {
  // Three-node flow at the top (Experiences → Targeting → Goals) with
  // Targeting highlighted; three config cards on the right.
  const nodes = ['Experiences', 'Targeting', 'Goals'];
  return (
    <Frame label="Targeting — audience, traffic, split" className={className}>
      {/* Three-node flow */}
      {nodes.map((n, i) => {
        const cx = 80 + i * 100;
        const active = n === 'Targeting';
        return (
          <g key={n}>
            {i < nodes.length - 1 && (
              <line
                x1={cx + 14}
                y1={42}
                x2={cx + 86}
                y2={42}
                stroke={i === 0 ? ACCENT : RULE}
                strokeWidth="1.5"
              />
            )}
            <circle
              cx={cx}
              cy={42}
              r="13"
              fill={active ? ACCENT : '#ffffff'}
              stroke={active ? ACCENT : RULE}
              strokeWidth={active ? 1.6 : 1}
            />
            <text
              x={cx}
              y={46}
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              fill={active ? '#ffffff' : MUTED}
            >
              {i + 1}
            </text>
            <text
              x={cx}
              y={74}
              fontSize="10"
              fontWeight={active ? 700 : 500}
              textAnchor="middle"
              fill={active ? INK : MUTED}
              letterSpacing="0.4"
            >
              {n}
            </text>
          </g>
        );
      })}

      {/* Config card stack on right */}
      <text
        x="330"
        y="34"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.2"
        fill={MUTED}
      >
        CONFIG
      </text>
      {[
        { label: 'Audience', value: 'All Visitors' },
        { label: 'Visitor Percentage', value: '100%' },
        { label: 'Split', value: 'A 34%  ·  B 33%  ·  C 33%' },
      ].map((card, i) => {
        const y = 48 + i * 50;
        return (
          <g key={card.label}>
            <rect
              x="330"
              y={y}
              width="246"
              height="40"
              rx="5"
              fill={SURFACE}
              stroke={i === 0 ? ACCENT : RULE}
              strokeWidth={i === 0 ? 1.4 : 1}
            />
            <text
              x="344"
              y={y + 18}
              fontSize="10"
              fontWeight="600"
              letterSpacing="1"
              fill={MUTED}
            >
              {card.label.toUpperCase()}
            </text>
            <text x="344" y={y + 32} fontSize="12" fill={INK}>
              {card.value}
            </text>
          </g>
        );
      })}

      {/* Reminder strip */}
      <text x="24" y="108" fontSize="10" fontWeight="600" letterSpacing="1.2" fill={MUTED}>
        FLOW DIAGRAM
      </text>
      <text x="24" y="128" fontSize="11" fill={INK}>
        Click any node to jump.
      </text>
      <text x="24" y="146" fontSize="11" fill={MUTED}>
        Adobe shows the same
      </text>
      <text x="24" y="162" fontSize="11" fill={MUTED}>
        three nodes in-product.
      </text>
    </Frame>
  );
}

function GoalsDiagram({ className }: DiagramProps) {
  // Goal Metric dropdown, Reporting Source pill toggle, Priority slider,
  // Duration date range. Compact form layout.
  return (
    <Frame label="Goals & settings" className={className}>
      <text
        x="24"
        y="34"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.2"
        fill={MUTED}
      >
        GOAL METRIC
      </text>
      <rect x="24" y="44" width="220" height="32" rx="4" fill={SURFACE} stroke={RULE} />
      <text x="36" y="64" fontSize="12" fill={INK}>
        Purchase Conversion
      </text>

      <text
        x="260"
        y="34"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.2"
        fill={MUTED}
      >
        REPORTING SOURCE  ·  immutable
      </text>
      {(['Target', 'Adobe Analytics', 'CJA'] as const).map((label, i) => {
        const x = 260 + i * 110;
        const active = label === 'Adobe Analytics';
        return (
          <g key={label}>
            <rect
              x={x}
              y={44}
              width="100"
              height="32"
              rx="4"
              fill={active ? ACCENT : SURFACE}
              stroke={active ? ACCENT : RULE}
            />
            <text
              x={x + 50}
              y={64}
              fontSize="11"
              fontWeight={active ? 700 : 500}
              textAnchor="middle"
              fill={active ? '#ffffff' : INK}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Priority slider */}
      <text x="24" y="108" fontSize="10" fontWeight="600" letterSpacing="1.2" fill={MUTED}>
        PRIORITY  ·  750 / 999
      </text>
      <line x1="24" y1="128" x2="244" y2="128" stroke={RULE} strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="128" x2="190" y2="128" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <circle cx="190" cy="128" r="8" fill="#ffffff" stroke={ACCENT} strokeWidth="2" />

      {/* Duration — box widened so the ISO date range doesn't bleed out. */}
      <text x="260" y="108" fontSize="10" fontWeight="600" letterSpacing="1.2" fill={MUTED}>
        DURATION
      </text>
      <rect x="260" y="118" width="216" height="32" rx="4" fill={SURFACE} stroke={RULE} />
      <text x="272" y="138" fontSize="12" fill={INK}>
        2026-06-01 → 2026-06-29
      </text>

      {/* Audiences for reporting */}
      <text x="24" y="174" fontSize="10" fontWeight="600" letterSpacing="1.2" fill={MUTED}>
        AUDIENCES FOR REPORTING
      </text>
      {['High-Value', 'New Visitors', 'Mobile'].map((a, i) => {
        const x = 24 + i * 102;
        return (
          <g key={a}>
            <rect x={x} y={184} width="92" height="22" rx="11" fill="#ffffff" stroke={RULE} />
            <text x={x + 46} y={200} fontSize="11" textAnchor="middle" fill={INK}>
              {a}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}

function SaveDiagram({ className }: DiagramProps) {
  // QA URL bar with at_preview_token highlighted, plus an experience
  // preview selector dropdown.
  return (
    <Frame label="Save and QA — preview token" className={className}>
      <text
        x="24"
        y="34"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.2"
        fill={MUTED}
      >
        QA URL
      </text>
      {/* Browser-like address bar */}
      <rect x="24" y="46" width="552" height="46" rx="22" fill={SURFACE} stroke={RULE} />
      <circle cx="50" cy="69" r="8" fill="#ffffff" stroke={RULE} />
      <path
        d="M46 69 a4 4 0 1 1 8 0 a4 4 0 1 1 -8 0"
        fill="none"
        stroke={MUTED}
        strokeWidth="1.4"
      />
      <text x="72" y="74" fontSize="13" fill={INK}>
        https://shop.example.com/pricing
      </text>
      <text x="320" y="74" fontSize="13" fill={MUTED}>
        ?
      </text>
      <rect x="328" y="58" width="234" height="22" rx="4" fill="#fef0ee" stroke={ACCENT} strokeWidth="1.4" />
      <text x="338" y="74" fontSize="12" fontWeight="600" fill={ACCENT}>
        at_preview_token=abc123
      </text>

      {/* Experience dropdown */}
      <text
        x="24"
        y="122"
        fontSize="10"
        fontWeight="600"
        letterSpacing="1.2"
        fill={MUTED}
      >
        PREVIEW EXPERIENCE
      </text>
      <rect x="24" y="132" width="200" height="34" rx="5" fill="#ffffff" stroke={RULE} />
      <text x="36" y="153" fontSize="12" fill={INK}>
        Experience B — “Start 14-day trial”
      </text>
      <path d="M204 144 L212 152 L220 144" fill="none" stroke={MUTED} strokeWidth="1.4" />

      {/* Pass / fail checklist */}
      <text x="248" y="122" fontSize="10" fontWeight="600" letterSpacing="1.2" fill={MUTED}>
        QA CHECKS
      </text>
      {[
        'Variant rendered',
        'Tracking events fire',
        'Cross-browser pass',
      ].map((c, i) => {
        const y = 138 + i * 24;
        return (
          <g key={c}>
            <circle cx="260" cy={y} r="6.5" fill={TEAL} />
            <path
              d={`M${260 - 3} ${y} L${260 - 1} ${y + 3} L${260 + 4} ${y - 2}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <text x="274" y={y + 4} fontSize="12" fill={INK}>
              {c}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}

// Keyed registry so the walkthrough engine can render the right diagram
// for the current step.id with one lookup.
export const STEP_DIAGRAMS: Record<string, (props: DiagramProps) => ReactElement> = {
  create: CreateDiagram,
  name: NameDiagram,
  experiences: ExperiencesDiagram,
  targeting: TargetingDiagram,
  goals: GoalsDiagram,
  save: SaveDiagram,
};
