// Setup Walk-through content config.
//
// Six steps that map to Adobe's documented activity-creation flow
// (Create → Name → Experiences → Targeting → Goals & Settings → Save & QA).
// The middle three are the canonical three-node "flow diagram" Adobe shows
// in-product. We keep one skeleton for every activity type and let `byType`
// inject the type-specific notes + example data.
//
// Edit prose freely here without touching the rendering component.

export type ActivityType = 'ab' | 'auto-target' | 'xt';

export type ActivityTypeMeta = {
  id: ActivityType;
  label: string;
  blurb: string;
};

export const ACTIVITY_TYPES: ActivityTypeMeta[] = [
  {
    id: 'ab',
    label: 'A/B Test',
    blurb:
      'Pick a winner between two or more variants. One audience, random traffic split.',
  },
  {
    id: 'auto-target',
    label: 'Auto-Target',
    blurb:
      'ML-driven personalisation. Premium-only. Needs significant volume to learn.',
  },
  {
    id: 'xt',
    label: 'Experience Targeting',
    blurb:
      'Different experiences for different segments. Audience is per-experience.',
  },
];

export type ExampleField = { label: string; value: string };

export type WalkthroughStep = {
  id: string;
  shortLabel: string; // for the stepper
  title: string; // for the body header
  purpose: string; // 1-sentence subtitle
  body: string;
  inputs: string[];
  gotchas: string[];
  // Per-type addendum that renders as a small highlighted note.
  byType?: Partial<Record<ActivityType, { note: string }>>;
  // Example data: either a universal block applied to all types, or a
  // per-type block (used on Targeting, where the three diverge sharply).
  example: {
    universal?: ExampleField[];
    byType?: Partial<Record<ActivityType, ExampleField[]>>;
  };
};

export const STEPS: WalkthroughStep[] = [
  {
    id: 'create',
    shortLabel: 'Create',
    title: 'Create the activity',
    purpose: 'Pick the activity type, composer, and workspace.',
    body:
      'From the Target Activities list, click Create Activity and pick the type. Choose your composer — Visual Experience Composer for most page edits, Form-Based for headless / email / API delivery, SPA-VEC for single-page apps. On Premium accounts, choose the workspace that owns the activity. Paste the Activity URL — the page you’ll work against.',
    inputs: [
      'Activity type (A/B / Auto-Target / Experience Targeting)',
      'Composer (VEC / Form-Based / SPA-VEC)',
      'Workspace (Premium only)',
      'Activity URL',
    ],
    gotchas: [
      'Activity type is locked at creation — converting A/B to Auto-Target later is not supported.',
      'Auto-Target requires Target Premium; A/B and Experience Targeting are available on Standard.',
    ],
    example: {
      universal: [
        { label: 'Composer', value: 'Visual Experience Composer' },
        { label: 'Workspace', value: 'Growth Marketing' },
        { label: 'Activity URL', value: 'https://shop.example.com/pricing' },
      ],
    },
  },
  {
    id: 'name',
    shortLabel: 'Name',
    title: 'Name the activity',
    purpose: 'Give it a name future-you will recognise in the list.',
    body:
      'Click the edit icon next to “Untitled Activity” at the top of the page. Use a name that signals quarter, surface, and intent — you’ll thank yourself in three months when scanning the activity list.',
    inputs: ['Activity name'],
    gotchas: [
      'Names cannot start with = + - @, and cannot contain ;= ,+ [" "] — that’s a CSV-injection guard from Adobe, not a typo.',
    ],
    example: {
      universal: [
        { label: 'Name', value: '2026Q2 — Pricing Page Hero CTA Test' },
      ],
    },
  },
  {
    id: 'experiences',
    shortLabel: 'Experiences',
    title: 'Create the experiences',
    purpose: 'Define the variants you want to compare.',
    body:
      'Experience A is the control (your current page). Add Experience B (and C, D…) using the visual editor — modify text, swap images, change CTAs, or run multi-page flows. Each variant should test one well-defined idea so the result is interpretable.',
    inputs: ['Per-experience name', 'DOM edits / offers / multi-page flow'],
    gotchas: [
      'More variants means more traffic needed. Two or three is usually plenty — save the megalist for a follow-up MVT.',
    ],
    example: {
      universal: [
        { label: 'Experience A', value: 'Control — “Get started free”' },
        { label: 'Experience B', value: '“Start 14-day trial”' },
        { label: 'Experience C', value: '“Talk to sales”' },
      ],
    },
  },
  {
    id: 'targeting',
    shortLabel: 'Targeting',
    title: 'Targeting — audience, traffic, split',
    purpose: 'Who sees it, how much qualifying traffic enters, how it’s split.',
    body:
      'Click the Targeting node in the flow diagram. Three configuration cards appear on the right: Audience, Visitor Percentage of qualifying traffic, and the per-experience split (must sum to 100%). Choose Manual to set fixed splits, Auto-Allocate for Multi-Arm Bandit, or Auto-Target for the ML-driven personalisation model.',
    inputs: [
      'Audience (defaults to All Visitors)',
      'Visitor Percentage (0–100)',
      'Traffic Allocation method',
      'Per-experience split',
    ],
    gotchas: [
      '“Activity-specific” audiences aren’t saved to your library — easy to lose reusable targeting logic.',
      'Splits must total 100% or save will fail.',
    ],
    byType: {
      ab: {
        note: 'A/B: one audience applies to the whole activity. Traffic is split randomly across all experiences.',
      },
      'auto-target': {
        note: 'Auto-Target: one activity-level audience. Traffic Allocation is set to Auto-Target — a Random Forest model routes each visitor to the predicted-best experience. Reserve at least 10% as a random control / holdout. Volume gates: ≥1,000 visits + ≥50 conversions per experience per day; activity total ≥7,000 visits / 350 conversions. Sweet spot: 4–6 locations × 4–6 offers.',
      },
      xt: {
        note: 'Experience Targeting: audience is bound per experience, not per activity. Each experience tab has its own Add Audience dialog. Visitors are evaluated top-to-bottom — first match wins, so order most-restrictive first (San Francisco → California → US → All Visitors). Add an “All Visitors” experience at the bottom as fallback.',
      },
    },
    example: {
      byType: {
        ab: [
          { label: 'Audience', value: 'All Visitors' },
          { label: 'Qualifying traffic', value: '100%' },
          { label: 'Split', value: 'A 34% · B 33% · C 33%' },
        ],
        'auto-target': [
          { label: 'Audience', value: 'All Visitors' },
          { label: 'Control / holdout', value: '20%' },
          { label: 'Auto-allocated', value: 'B + C — 80% via ML' },
          { label: 'Goal metric for ML', value: 'Purchase Conversion' },
        ],
        xt: [
          {
            label: 'Exp B audience',
            value: 'URL contains /pricing AND trial_age_days ≥ 7 AND geo.country = US',
          },
          { label: 'Exp C audience', value: 'profile.account_type = enterprise' },
          { label: 'Exp A audience', value: 'All Visitors (fallback)' },
          { label: 'Evaluation order', value: 'Top → bottom · first match wins' },
        ],
      },
    },
  },
  {
    id: 'goals',
    shortLabel: 'Goals',
    title: 'Goals & settings',
    purpose: 'Objective, metrics, duration, reporting source.',
    body:
      'Set the activity Objective (free text), Priority (0–999 or Low / Med / High), Duration (start + end), Reporting Source, Goal Metric, Estimated Value, and Additional Metrics. Use Audiences for Reporting to read how specific segments performed within the activity.',
    inputs: [
      'Objective',
      'Priority',
      'Duration (start / end)',
      'Reporting Source',
      'Goal Metric',
      'Estimated Value',
      'Additional Metrics',
      'Audiences for Reporting',
    ],
    gotchas: [
      'Reporting Source is immutable after the activity goes live. Choose carefully — switching Target ↔ Analytics ↔ CJA later requires duplicating the activity.',
      'Analytics-for-Target locks you to conversion metrics and disables Additional Metrics and Audiences-for-Reporting.',
    ],
    byType: {
      'auto-target': {
        note: 'Auto-Target: the Goal Metric drives the ML model. Conversion is the safest default; Revenue per Visit needs much more data. CJA reporting is not supported for Auto-Target.',
      },
      xt: {
        note: 'XT: Audiences for Reporting is the headline output. XT isn’t about a winner — it’s about per-segment performance. Configure them deliberately.',
      },
    },
    example: {
      universal: [
        { label: 'Objective', value: 'Lift paid signups from pricing page' },
        { label: 'Priority', value: '750' },
        { label: 'Duration', value: '2026-06-01 → 2026-06-29' },
        { label: 'Reporting Source', value: 'Adobe Analytics (A4T)' },
        { label: 'Goal Metric', value: 'Purchase Conversion' },
        { label: 'Estimated Value', value: '$120 / conversion' },
        { label: 'Audiences for Reporting', value: 'High-Value Customers' },
      ],
    },
  },
  {
    id: 'save',
    shortLabel: 'Save & QA',
    title: 'Save and QA',
    purpose: 'Generate the QA URL and validate every experience before launch.',
    body:
      'Click Save & Close to exit the editor to the Activity Overview diagram. Grab the QA URL — it carries an at_preview_token parameter that lets you preview each experience by name. Walk each variant end-to-end (every breakpoint, every browser), confirm tracking fires, and only then approve for launch.',
    inputs: [
      'QA sign-off across all variants',
      'Tracking verification (mbox trace + Analytics events)',
      'Cross-browser / responsive check',
    ],
    gotchas: [
      'QA tokens bypass audience qualification — your QA pass does not prove targeting is correct. Pair it with an audience test on a real account that should / shouldn’t qualify.',
    ],
    example: {
      universal: [
        {
          label: 'QA URL',
          value: 'https://shop.example.com/pricing?at_preview_token=abc123',
        },
        { label: 'Preview experiences', value: 'A / B / C selectable via dropdown' },
      ],
    },
  },
];
