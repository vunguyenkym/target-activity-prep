# Adobe Target Activity Prep — project manifest

> One-paste briefing for any LLM (Claude, GPT, etc.) to understand this project before helping with it. Not user-facing documentation.

**Live:** https://adobetarget.app
**Repo:** https://github.com/vunguyenkym/target-activity-prep
**Status:** in development, single maintainer

---

## What it is

A local-first web app that walks a marketer or business analyst through preparing an Adobe Target experimentation activity end-to-end — from hypothesis to archive. Everything is filled in via guided forms; the app produces a polished Specs PDF (for stakeholder review) and an Activity Summary PDF (for post-launch retro).

**Who it's for:** Adobe Target practitioners — marketers, BAs, optimisation specialists — preparing A/B, Auto-Target, XT, AP, or Recommendations activities. Not developers, not engineers.

**What it isn't:**
- Not a replacement for Adobe Target itself
- Not affiliated with or endorsed by Adobe Inc. ("Adobe Target" is a trademark of Adobe Inc.)
- Not a runtime testing tool — it does not deliver experiences to visitors
- Not a multi-user / collaborative tool — each browser holds one activity

## The problem it solves

Marketers prepping Target activities typically jump between Word docs, Confluence, Excel sample-size calculators, and Slack threads — losing context and shipping under-specified activities. This app provides a single guided workflow with built-in calculators, value-realisation framework, prefilled examples, and clean PDF exports.

---

## Information architecture

```
/home                              ← Landing page (welcome, progression visual, CTA tiles)
/                                  ← 307 redirect → /home

Activity Planning
  Phase 1 — Plan
    /phase-1/overview              ← Activity name, owner, KBO, dates
    /phase-1/hypothesis            ← Structured hypothesis + primary/secondary metrics
    /phase-1/audience              ← Targeting + exclusion rules
    /phase-1/feasibility           ← Composer, tracking, integrations
    /phase-1/comparison            ← Control + variant cards with screenshots
    /phase-1/sample-size           ← Two-proportion z-test calculator
    /phase-1/qa                    ← Pre-launch checklist
    /phase-1/specifications        ← Generates Specs PDF (download)
  Phase 2 — Launch
    /phase-2/launch                ← Launch-day checklist
  Phase 3 — Evaluate
    /phase-3/evaluation            ← Outcome, observed lift, A4T screenshot
    /phase-3/value-realisation     ← Adobe Value Framework: A × B × C = D
    /phase-3/archive               ← Key findings + Activity Summary PDF (download)

Knowledge
  /knowledge/setup-walkthrough     ← Interactive 6-step Target setup guide
  /knowledge/activity-types
  /knowledge/methodology
  /knowledge/pitfalls
  /knowledge/roles-cadence
  /knowledge/prioritization
```

20 routes total. Every route is statically prerendered (`○ Static`) — no API routes, no server runtime, no database.

---

## Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16.2.6 (App Router, Turbopack) | `output: 'export'`-compatible — all `○ Static` |
| Runtime | React 19.2.4 | Server components for static pages, client for forms |
| Language | TypeScript 5, strict mode, no `any` | Strict no-`any` policy |
| Styling | Tailwind v4 + `tw-animate-css` | Single utility-first system |
| Components | shadcn/ui on top of Base UI primitives | `components/ui/*` |
| Storage | Dexie 4 / IndexedDB | One activity at a time, schema v7 |
| Forms | react-hook-form | Controlled via `Controller` for Select/Toggle |
| Reactive queries | dexie-react-hooks `useLiveQuery` | Re-renders on IDB changes |
| PDFs | jsPDF 4 | Plus Jakarta Sans embedded via `addFileToVFS` |
| Icons | lucide-react 1.16 | Minimalist, sized 3-4 |
| Font | Plus Jakarta Sans (UI + PDF) | Google Fonts via `next/font` |
| Hosting | Vercel (free Hobby) | Static deployment, auto-deploy on push to `main` |
| Domain | adobetarget.app | Vercel-managed DNS |
| Email | (none yet) | Feedback delivery is on the roadmap |
| Testing | `node --test` smoke tests | 20 routes assert HTTP 200 + heading match |

**Important note from the repo's AGENTS.md:** "This is NOT the Next.js you know." Next.js 16 has breaking changes from earlier versions; consult `node_modules/next/dist/docs/` before assuming an API still exists. Heed deprecation notices.

---

## Architecture principles

1. **Local-first.** All user data lives in the visitor's IndexedDB. No accounts, no sync, no analytics, no server-side persistence. The site is a pile of static assets plus a single Dexie schema.
2. **Single activity per browser.** `localStorage.targetActivityPrep.currentActivityId` points to the one active activity. There's no list / dashboard / activity picker. Switching context = clear + create new.
3. **Save-as-you-type.** Every form field persists via `onBlur` → `saveActivity()`. No explicit save buttons.
4. **No `any`, no `unknown` leaks.** Strict TypeScript everywhere. Use `Partial<Record<…>>` when shape-of-keys is dynamic.
5. **Every change ships through `npm run check`** (`tsc --noEmit && next build && node --test tests/smoke.test.mjs`) before `git push`. Vercel auto-deploys on `main`.

---

## The Activity data model (Dexie v7)

Defined in `lib/storage.ts`. One row in `activities`, plus a separate `feedback` table.

```ts
type Activity = {
  id: string;                  // UUID, stable across edits
  createdAt: string;           // ISO, never updated
  updatedAt: string;           // ISO, advances on every saveActivity()
  overview: {
    name: string;              // primary identity field
    owner: string;
    approver: string;
    siteUrl: string;
    testLocationUrl: string;
    workspace: string;         // Adobe Target workspace
    activityType: 'A/B' | 'MVT' | 'XT' | 'AP' | 'Recommendations';
    startDate: string;
    endDate: string;
    kbo: string;               // Key Business Objective
    context: string;
  };
  hypothesis: {
    audienceScope: string;
    currentState: string;
    change: string;
    outcome: string;
    reasoning: string;
    statement: string;         // composed sentence from the 5 above
  };
  metrics: {
    primary: Metric | null;
    secondary: Metric[];
    guardrails: Metric[];
    businessSignificanceThreshold: string;
  };
  sampleSize: {
    inputs: { baselineRate, mde, mdeType: 'absolute'|'relative',
              confidence, power, variants, dailyTraffic,
              expectedLiftNarrative };
    outputs: { perVariant, total, days };       // computed via two-proportion z-test
    sensitivity: { mdeMultiplier, perVariant, days }[];
  };
  audience: { description, targetingRules, exclusionRules, splitNotes, segmentValidated };
  feasibility: { implementationMethod, domStability, trackingValidated, integrations[], blockersNotes };
  comparison: {
    control: { name, description, url, screenshot };  // screenshot = base64 data URL
    variants: Variant[];
  };
  qa: { items: Partial<Record<QaItemId, boolean>>, notes };
  launch: { items: Partial<Record<LaunchItemId, boolean>>, launchDate, firstReviewDate };
  evaluation: {
    outcome: '' | 'won' | 'lost' | 'inconclusive';
    confidenceLevel: number;
    observedLift: string;              // narrative
    observedLiftPercent: number;       // numeric — auto-syncs to valueRealisation.changePercent
    actualDays: number;
    a4tScreenshot: string;             // base64 data URL
    businessImpact: string;
    technicalIssues: string;
    significanceCall: string;
    recommendedNextStep: string;
  };
  valueRealisation: {                  // Adobe Value Framework: A × B × C = D
    driverLabel, driverValue;          // A
    changeLabel, changePercent;        // B (auto-synced from evaluation.observedLiftPercent)
    valuationLabel, valuationValue;    // C
    impactType: 'incremental-revenue' | 'cost-avoidance' | 'cost-savings' | 'productivity-gains';
    methodologyNotes, caveats;
  };
  archive: { keyFindings: string; status: 'active' | 'archived' };
  specifications: { generatedAt: string };
};
```

**Schema versions** evolve via Dexie `.upgrade()` callbacks — `patchActivityToV2`/V3/V4/V5/V6 — each idempotently fills new fields with defaults. Current version is **v7** (which adds the `feedback` table, no activity changes).

---

## Notable features (chronological)

- **Guided forms** for every section, with prompts, helper text, and inline validation
- **Sample size calculator** (`lib/sample-size.ts`) — two-proportion z-test with sensitivity grid
- **Hypothesis composer** — assembles a structured sentence from 5 fields
- **Example prefill** — `makeDefaultActivity()` picks one of 3 scenarios at random (`lib/examples.ts`) and randomises numeric values within plausible ranges
- **Auto-prefill on first visit** — `isUntouchedActivity()` checks for blank name + same createdAt/updatedAt
- **Per-section "Load example"** on Overview, Value Realisation (and others can be added)
- **"Clear data" button** next to Load Example on Overview, wipes the activity back to blank (preserves id+createdAt; advances updatedAt so auto-prefill doesn't fire)
- **Mockup canvas** for Experience Comparison — 2 example SVG→JPEG mockups bundled
- **Screenshot upload** for control/variants and A4T dashboard — resized client-side to 1200×800 max, stored as JPEG data URL in IDB
- **Specs PDF** (`lib/spec-pdf.ts`) — A4 portrait, embedded Plus Jakarta Sans, includes mockup row, sample-size outputs, audience/feasibility summary, QA checklist
- **Summary PDF** (`lib/summary-pdf.ts`) — section-labeled, includes 5-row hypothesis breakdown, Planned-vs-Actual tile pair (Per Variant / Planned Duration · Observed Lift / Actual Duration), outcome chip, comparison mockups, value-realisation tiles (A/B/C/D), A4T screenshot, key findings
- **Interactive Setup Walk-through** (`/knowledge/setup-walkthrough`) — 6-step guide mirroring Adobe's documented flow (Create → Name → Experiences → Targeting → Goals → Save & QA), with activity-type toggle (A/B / Auto-Target / XT), per-step schematic SVG (own IP, not Adobe screenshots), "Show example" toggle, "See in Adobe docs" deep-link with per-type override, keyboard nav (← / →)
- **Phase 1 progress** sticky in the sidebar — counts 7 trackable Phase 1 sections
- **Sectioned home page** — hero + overall progress + step CTA tiles + Knowledge tiles + privacy disclaimer
- **Floating Feedback button** — appears after >5 pages AND >2 min in a session, stores submissions in Dexie `feedback` table (UI-only, no server delivery yet)
- **Privacy disclaimer** on `/home` covers: unofficial Adobe tool, in-development, data lives only in IndexedDB

---

## Hardening already done (pen-test pass)

- **HTTP security headers** via `vercel.json`:
  - `Content-Security-Policy` (default-src 'self'; img-src 'self' data: blob:; …)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` denies camera/mic/geolocation/payment/usb/FLoC
  - `Cross-Origin-Opener-Policy: same-origin`
  - HSTS (2-year) — Vercel default
- **No `dangerouslySetInnerHTML`** anywhere (one latent sink removed in `specifications-form.tsx`)
- **No `process.env.*` reads** in app code (no env vars to leak)
- **No external `fetch()` calls** (offline-capable after bundle load)
- **TLS A+** via Vercel + Let's Encrypt, CAA records locked to LE / pki.goog / Sectigo
- **No secrets committed** to git history
- **GitHub repo:** Dependabot alerts, security updates, secret scanning, push protection — all on

**Still pending:** DNSSEC at the registrar; manual XSS payload test in browser (low priority — React auto-escapes everywhere and no innerHTML sinks remain).

---

## Conventions

- **File structure:** `app/` for routes (App Router), `components/` for shared client components, `components/ui/` for shadcn primitives, `lib/` for non-UI logic (storage, PDF, calculators, content configs).
- **Naming:** `kebab-case` for files, `PascalCase` for components, `camelCase` for functions.
- **Forms:** every form is a `'use client'` component that takes `activity: Activity`, uses `react-hook-form`, and calls `saveActivity()` from `onBlur` handlers.
- **Persistence:** never call `db().activities.put()` directly — always go through `saveActivity()` so `updatedAt` advances.
- **Schema changes:** bump the Dexie version, add a `patchActivityToVN(row)` that fills new fields with defaults, add a `defaultX()` helper if a new section is introduced.
- **Strict no-`any`:** if TS complains, refine the type rather than escape it. Use `Partial<Record<K, V>>` for keyed sparse data, generic Lucide icons as `LucideIcon`, etc.
- **Commit messages:** concise imperative ("Add X", "Fix Y"), with a multi-line body explaining the *why* when the change is non-obvious.

---

## Workflow (for the maintainer)

```bash
# Develop
npm run dev

# Pre-push gate (typecheck + build + 20 smoke tests)
npm run check

# Ship
git add . && git commit -m "..." && git push   # Vercel auto-deploys main
```

---

## Limitations (be honest about these)

1. **Single activity per browser.** No multi-activity dashboard, no switching, no shared workspace. Deliberate scope.
2. **No accounts, no sync, no sharing.** Data exists only on the device that typed it. Switching browsers / devices = starting over.
3. **No backend.** No way to export/import an activity as JSON yet (would be a small addition). PDF exports are the current bridge to other systems.
4. **Feedback button doesn't actually send anywhere.** Submissions land in IndexedDB until a server-side delivery path is wired up (Vercel Cron + Resend planned).
5. **No real-time collaboration.** Single user, single device. Multi-user would require a backend.
6. **No analytics.** Intentional, but it also means we don't know how the app is being used.
7. **Browser-data-loss risk.** "Clear site data" or browser privacy modes can wipe everything. No recovery path. Mentioned in the in-app disclaimer.
8. **Adobe Target API is not integrated.** This is a planning + retro tool — you still have to enter the activity in Target manually. No bidirectional sync, no read-back of results from Adobe's API.
9. **One scenario family in examples.** Three example scenarios, hand-written. Real Target activities span many more shapes; the examples are illustrative, not exhaustive.
10. **PostCSS GHSA-qx2v-qp2m-jg93** — moderate transitive vuln via Next.js. Build-time only, not exploitable at runtime. Will resolve when Next.js publishes a patch.
11. **`'unsafe-inline'` in CSP** — required for Next.js's inline hydration scripts. Could be tightened to nonce-based CSP via a custom server, but with no user-data-on-wire the marginal value is low.
12. **Local-time only.** Dates render in the browser's locale; PDF dates use the activity's stored ISO strings.

---

## Recent commit log (most recent at top)

```
8a565f7 Add floating Feedback button (UI-only, local stash)
8684552 Add Clear data button next to Load example on Overview
5458028 Harden security headers + remove dangerouslySetInnerHTML sink
87f6b45 Widen Duration box on Goals diagram so date range stays inside
cb70620 Add schematic diagrams + Adobe deep-links to Setup Walk-through
f35609c Add interactive Setup Walk-through to Knowledge
8fe3010 Redirect / to /home so the landing page is the homepage
93b4dbd Add disclaimer block to /home
c7f4c43 Add npm run check script for pre-push verification
e260e51 Build Adobe Target Activity Prep app
```

---

## When helping with this project, lean toward:

- Small, focused commits — one concept per commit.
- Strict TypeScript — refine, don't escape.
- Local-first defaults — don't add external dependencies without a reason.
- Match existing conventions (form patterns, file structure, naming).
- Run `npm run check` before claiming a change is ready.
- Read AGENTS.md (in repo root) for Next.js 16 idioms — it's NOT the Next.js you may recall.
- Keep the privacy / no-server story honest. If a change crosses that line, surface it.
