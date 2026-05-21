'use client';

import Dexie, { type Table } from 'dexie';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  LAUNCH_ITEMS,
  QA_ITEMS,
  type LaunchItemId,
  type QaItemId,
} from './checklists';

function exampleQaItems(): Partial<Record<QaItemId, boolean>> {
  const out: Partial<Record<QaItemId, boolean>> = {};
  for (const item of QA_ITEMS) out[item.id] = true;
  return out;
}

function exampleLaunchItems(): Partial<Record<LaunchItemId, boolean>> {
  const out: Partial<Record<LaunchItemId, boolean>> = {};
  for (const item of LAUNCH_ITEMS) out[item.id] = true;
  return out;
}
import { composeStatement, metricFromType } from './metrics';
import { computeOutputs, computeSensitivity } from './sample-size';
import { getExampleMockups } from './example-mockups';
import {
  APPROVER_POOL,
  OWNER_POOL,
  SCENARIOS,
  WORKSPACE_POOL,
  isoDateOffsetDays,
  pickOne,
  pickRange,
  pickRangeInt,
  randInt,
} from './examples';

export type ActivityType = 'A/B' | 'MVT' | 'XT' | 'AP' | 'Recommendations';

export type MetricType =
  | 'conversion_rate'
  | 'rpv'
  | 'aov'
  | 'ctr'
  | 'form_completion'
  | 'video_engagement'
  | 'custom';

export type Metric = {
  name: string;
  type: MetricType;
  description: string;
};

export type MdeType = 'absolute' | 'relative';

export type ImplementationMethod =
  | ''
  | 'vec'
  | 'form-based'
  | 'custom-code'
  | 'recommendations';

export type DomStability = '' | 'low' | 'medium' | 'high';

export type IntegrationId =
  | 'a4t'
  | 'aam'
  | 'cdp'
  | 'aem'
  | 'campaign'
  | 'ajo'
  | 'other';

export type EvaluationOutcome = '' | 'won' | 'lost' | 'inconclusive';

export type ArchiveStatus = 'active' | 'archived';

export type ValueImpactType =
  | 'incremental-revenue'
  | 'cost-avoidance'
  | 'cost-savings'
  | 'productivity-gains';

export type ValueRealisation = {
  driverLabel: string;
  driverValue: number;
  changeLabel: string;
  changePercent: number;
  valuationLabel: string;
  valuationValue: number;
  impactType: ValueImpactType;
  methodologyNotes: string;
  caveats: string;
};

export type Variant = {
  id: string;
  name: string;
  description: string;
  url: string;
  splitPercent: number;
  screenshot: string;
};

export type Activity = {
  id: string;
  createdAt: string;
  updatedAt: string;
  overview: {
    name: string;
    owner: string;
    siteUrl: string;
    activityType: ActivityType;
    startDate: string;
    endDate: string;
    context: string;
    workspace: string;
    testLocationUrl: string;
    kbo: string;
    approver: string;
  };
  hypothesis: {
    currentState: string;
    change: string;
    outcome: string;
    reasoning: string;
    audienceScope: string;
    statement: string;
  };
  metrics: {
    primary: Metric | null;
    secondary: Metric[];
    guardrails: Metric[];
    businessSignificanceThreshold: string;
  };
  sampleSize: {
    inputs: {
      baselineRate: number;
      mde: number;
      mdeType: MdeType;
      confidence: number;
      power: number;
      variants: number;
      dailyTraffic: number;
      expectedLiftNarrative: string;
    };
    outputs: {
      perVariant: number;
      total: number;
      days: number;
    };
    sensitivity: { mdeMultiplier: number; perVariant: number; days: number }[];
  };
  audience: {
    description: string;
    targetingRules: string;
    exclusionRules: string;
    splitNotes: string;
    segmentValidated: boolean;
  };
  feasibility: {
    implementationMethod: ImplementationMethod;
    domStability: DomStability;
    trackingValidated: boolean;
    integrations: IntegrationId[];
    blockersNotes: string;
  };
  comparison: {
    control: {
      name: string;
      description: string;
      url: string;
      screenshot: string;
    };
    variants: Variant[];
  };
  qa: {
    items: Partial<Record<QaItemId, boolean>>;
    notes: string;
  };
  launch: {
    items: Partial<Record<LaunchItemId, boolean>>;
    launchDate: string;
    firstReviewDate: string;
  };
  evaluation: {
    outcome: EvaluationOutcome;
    confidenceLevel: number;
    observedLift: string;
    observedLiftPercent: number;
    actualDays: number;
    businessImpact: string;
    technicalIssues: string;
    significanceCall: string;
    recommendedNextStep: string;
    a4tScreenshot: string;
  };
  valueRealisation: ValueRealisation;
  archive: {
    keyFindings: string;
    status: ArchiveStatus;
  };
  specifications: {
    generatedAt: string;
  };
};

export type SectionId =
  | 'overview'
  | 'hypothesis'
  | 'audience'
  | 'feasibility'
  | 'comparison'
  | 'sample-size'
  | 'qa'
  | 'specifications'
  | 'launch'
  | 'evaluation'
  | 'value-realisation'
  | 'archive';

class AppDb extends Dexie {
  activities!: Table<Activity, string>;
  constructor() {
    super('TargetActivityPrep');
    this.version(1).stores({
      activities: 'id, updatedAt',
    });
    this.version(2)
      .stores({
        activities: 'id, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('activities')
          .toCollection()
          .modify((row) => {
            patchActivityToV2(row as Record<string, unknown>);
          });
      });
    this.version(3)
      .stores({
        activities: 'id, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('activities')
          .toCollection()
          .modify((row) => {
            patchActivityToV3(row as Record<string, unknown>);
          });
      });
    this.version(4)
      .stores({
        activities: 'id, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('activities')
          .toCollection()
          .modify((row) => {
            patchActivityToV4(row as Record<string, unknown>);
          });
      });
    this.version(5)
      .stores({
        activities: 'id, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('activities')
          .toCollection()
          .modify((row) => {
            patchActivityToV5(row as Record<string, unknown>);
          });
      });
    this.version(6)
      .stores({
        activities: 'id, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('activities')
          .toCollection()
          .modify((row) => {
            patchActivityToV6(row as Record<string, unknown>);
          });
      });
  }
}

// Lazy-init so server-side module evaluation never touches indexedDB.
let dbInstance: AppDb | null = null;
function db(): AppDb {
  if (!dbInstance) dbInstance = new AppDb();
  return dbInstance;
}

const CURRENT_KEY = 'currentActivityId';

export async function makeDefaultActivity(): Promise<Activity> {
  const now = new Date().toISOString();
  const mockups = await getExampleMockups();
  const scenario = pickOne(SCENARIOS);
  const primary = metricFromType(scenario.primaryMetric.type);
  primary.name = scenario.primaryMetric.name;

  // Randomise numeric values within sensible ranges
  const baselineRate = pickRange(scenario.sampleSize.baselineRatePct, 1);
  const mde = pickRange(scenario.sampleSize.mdePctRelative, 1);
  const dailyTraffic = pickRangeInt(scenario.sampleSize.dailyTraffic);

  const sampleSizeInputs: Activity['sampleSize']['inputs'] = {
    baselineRate,
    mde,
    mdeType: 'relative',
    confidence: 95,
    power: 80,
    variants: scenario.sampleSize.variants,
    dailyTraffic,
    expectedLiftNarrative: scenario.expectedLiftNarrative,
  };

  const sampleSizeOutputs = computeOutputs(sampleSizeInputs);
  const sensitivity = computeSensitivity(sampleSizeInputs);

  // Round the baseline to a whole number for the human-readable narrative,
  // since we don't want "4.7%" appearing in copy.
  const baselineDisplay =
    Number.isInteger(baselineRate)
      ? baselineRate.toString()
      : baselineRate.toFixed(1);
  const hypothesis: Activity['hypothesis'] = {
    currentState: scenario.currentStateTemplate.replace(
      '{baseline}',
      baselineDisplay,
    ),
    change: scenario.change,
    outcome: scenario.outcome,
    reasoning: scenario.reasoning,
    audienceScope: scenario.audienceScope,
    statement: '',
  };
  hypothesis.statement = composeStatement({
    audienceScope: hypothesis.audienceScope,
    change: hypothesis.change,
    outcome: hypothesis.outcome,
    reasoning: hypothesis.reasoning,
    primaryName: primary.name,
    mde: sampleSizeInputs.mde,
    mdeType: sampleSizeInputs.mdeType,
    days: sampleSizeOutputs.days,
  });

  // Value Realisation — annualised driver derived from sample-size inputs.
  const annualBaselineConversions = Math.round(
    dailyTraffic * (baselineRate / 100) * 365,
  );
  const valuationValue = pickRange(
    scenario.valueRealisation.valuationRange,
    0,
  );
  const observedLiftPercent = pickRange(
    scenario.evaluationExample.observedLiftPercentRange,
    1,
  );

  // Schedule — start in the next 1–4 weeks, run for the calc'd duration.
  const startOffset = randInt(7, 28);
  const runDays = Math.max(sampleSizeOutputs.days, 7);
  const startDate = isoDateOffsetDays(startOffset);
  const endDate = isoDateOffsetDays(startOffset + runDays);

  const variants: Activity['comparison']['variants'] = [
    {
      id: crypto.randomUUID(),
      name: scenario.comparison.variantName,
      description: scenario.comparison.variantDescription,
      url: '',
      splitPercent: 50,
      screenshot: mockups.variant,
    },
  ];

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    overview: {
      name: scenario.name,
      owner: pickOne(OWNER_POOL),
      siteUrl: 'https://example.com',
      activityType: scenario.activityType,
      startDate,
      endDate,
      context: scenario.context,
      workspace: pickOne(WORKSPACE_POOL),
      testLocationUrl: 'https://example.com/',
      kbo: scenario.kbo,
      approver: pickOne(APPROVER_POOL),
    },
    hypothesis,
    metrics: {
      primary,
      secondary: scenario.secondaryMetrics.map((m) => {
        const metric = metricFromType(m.type);
        metric.name = m.name;
        return metric;
      }),
      guardrails: [
        { name: 'Bounce rate', type: 'custom', description: '' },
        { name: 'Page load time', type: 'custom', description: '' },
        { name: 'Error rate', type: 'custom', description: '' },
      ],
      businessSignificanceThreshold: scenario.businessSignificanceThreshold,
    },
    sampleSize: {
      inputs: sampleSizeInputs,
      outputs: sampleSizeOutputs,
      sensitivity,
    },
    audience: {
      description: scenario.audience.description,
      targetingRules: scenario.audience.targetingRules,
      exclusionRules: scenario.audience.exclusionRules,
      splitNotes: '50/50 between control and variant.',
      segmentValidated: false,
    },
    feasibility: {
      implementationMethod: scenario.feasibility.implementationMethod,
      domStability: scenario.feasibility.domStability,
      trackingValidated: false,
      integrations: scenario.feasibility.integrations,
      blockersNotes: scenario.feasibility.blockersNotes,
    },
    comparison: {
      control: {
        name: scenario.comparison.controlName,
        description: scenario.comparison.controlDescription,
        url: '',
        screenshot: mockups.control,
      },
      variants,
    },
    qa: {
      items: exampleQaItems(),
      notes: scenario.qaNotes,
    },
    launch: {
      items: exampleLaunchItems(),
      launchDate: startDate,
      firstReviewDate: isoDateOffsetDays(startOffset + 7),
    },
    evaluation: {
      outcome: 'won',
      confidenceLevel: 95,
      observedLift: scenario.evaluationExample.observedLift,
      observedLiftPercent,
      // Tests rarely land exactly on the calc'd day count — randomise within
      // ±15% of the planned days (clamped to a 7-day floor) so the actual
      // duration reads as plausibly different from the plan.
      actualDays: Math.max(
        7,
        Math.round(sampleSizeOutputs.days * (0.85 + Math.random() * 0.3)),
      ),
      businessImpact: scenario.evaluationExample.businessImpact,
      technicalIssues: scenario.evaluationExample.technicalIssues,
      significanceCall: scenario.evaluationExample.significanceCall,
      recommendedNextStep: scenario.evaluationExample.recommendedNextStep,
      a4tScreenshot: '',
    },
    valueRealisation: {
      driverLabel: scenario.valueRealisation.driverLabel,
      driverValue: annualBaselineConversions,
      changeLabel: scenario.valueRealisation.changeLabel,
      // Reflect the observed lift from the evaluation — that's the actual
      // lift the business will realise. Sample-size MDE is the planned
      // signal; observed lift is what we book.
      changePercent: Math.round(observedLiftPercent * 10) / 10,
      valuationLabel: scenario.valueRealisation.valuationLabel,
      valuationValue,
      impactType: scenario.valueRealisation.impactType,
      methodologyNotes: scenario.valueRealisation.methodologyNotes,
      caveats: scenario.valueRealisation.caveats,
    },
    archive: {
      keyFindings: pickOne(scenario.keyFindingsPool),
      status: 'active',
    },
    specifications: defaultSpecifications(),
  };
}

function defaultAudience(): Activity['audience'] {
  return {
    description: '',
    targetingRules: '',
    exclusionRules: '',
    splitNotes: '',
    segmentValidated: false,
  };
}

function defaultFeasibility(): Activity['feasibility'] {
  return {
    implementationMethod: '',
    domStability: '',
    trackingValidated: false,
    integrations: [],
    blockersNotes: '',
  };
}

function defaultComparison(): Activity['comparison'] {
  return {
    control: { name: 'Control', description: '', url: '', screenshot: '' },
    variants: [],
  };
}

function defaultQa(): Activity['qa'] {
  return { items: {}, notes: '' };
}

function defaultLaunch(): Activity['launch'] {
  return { items: {}, launchDate: '', firstReviewDate: '' };
}

function defaultEvaluation(): Activity['evaluation'] {
  return {
    outcome: '',
    confidenceLevel: 0,
    observedLift: '',
    observedLiftPercent: 0,
    actualDays: 0,
    businessImpact: '',
    technicalIssues: '',
    significanceCall: '',
    recommendedNextStep: '',
    a4tScreenshot: '',
  };
}

function defaultArchive(): Activity['archive'] {
  return { keyFindings: '', status: 'active' };
}

function defaultSpecifications(): Activity['specifications'] {
  return { generatedAt: '' };
}

function defaultValueRealisation(): ValueRealisation {
  return {
    driverLabel: '',
    driverValue: 0,
    changeLabel: '',
    changePercent: 0,
    valuationLabel: '',
    valuationValue: 0,
    impactType: 'incremental-revenue',
    methodologyNotes: '',
    caveats: '',
  };
}

// Patches a v1 row in place with all v2 fields, filling defaults where missing.
// Called from the Dexie upgrade hook; safe on rows that already have the field
// because we only write when missing.
function patchActivityToV2(row: Record<string, unknown>): void {
  const overview = (row.overview ??= {}) as Record<string, unknown>;
  overview.workspace ??= '';
  overview.testLocationUrl ??= '';
  overview.kbo ??= '';
  overview.approver ??= '';

  const metrics = (row.metrics ??= {}) as Record<string, unknown>;
  metrics.businessSignificanceThreshold ??= '';

  const sampleSize = (row.sampleSize ??= {}) as Record<string, unknown>;
  const inputs = (sampleSize.inputs ??= {}) as Record<string, unknown>;
  inputs.expectedLiftNarrative ??= '';

  if (!row.audience) row.audience = defaultAudience();
  if (!row.feasibility) row.feasibility = defaultFeasibility();
  if (!row.comparison) row.comparison = defaultComparison();
  if (!row.qa) row.qa = defaultQa();
  if (!row.launch) row.launch = defaultLaunch();
  if (!row.evaluation) row.evaluation = defaultEvaluation();
  if (!row.archive) row.archive = defaultArchive();
}

// v5 adds evaluation.observedLiftPercent (numeric — the headline number the
// VR section now reads from) and evaluation.a4tScreenshot (Adobe Analytics
// for Target dashboard screenshot, data URL).
function patchActivityToV5(row: Record<string, unknown>): void {
  const evaluation = (row.evaluation ??= defaultEvaluation()) as Record<
    string,
    unknown
  >;
  if (typeof evaluation.observedLiftPercent !== 'number') {
    evaluation.observedLiftPercent = 0;
  }
  if (typeof evaluation.a4tScreenshot !== 'string') {
    evaluation.a4tScreenshot = '';
  }
}

// v6 adds evaluation.actualDays — how long the test actually ran for, so we
// can compare against the planned sample-size days in the Summary PDF.
function patchActivityToV6(row: Record<string, unknown>): void {
  const evaluation = (row.evaluation ??= defaultEvaluation()) as Record<
    string,
    unknown
  >;
  if (typeof evaluation.actualDays !== 'number') {
    evaluation.actualDays = 0;
  }
}

// v4 adds the `valueRealisation` section and renames archive.lessonsLearned
// to archive.keyFindings. We preserve any existing prose under the new key.
function patchActivityToV4(row: Record<string, unknown>): void {
  if (!row.valueRealisation) row.valueRealisation = defaultValueRealisation();

  const archive = (row.archive ??= defaultArchive()) as Record<
    string,
    unknown
  >;
  if (typeof archive.keyFindings !== 'string') {
    const lessons = archive.lessonsLearned;
    archive.keyFindings = typeof lessons === 'string' ? lessons : '';
  }
  delete archive.lessonsLearned;
}

// v3 adds the `specifications` section and a `screenshot` field on every
// comparison variant (and on the control).
function patchActivityToV3(row: Record<string, unknown>): void {
  if (!row.specifications) row.specifications = defaultSpecifications();

  const comparison = (row.comparison ??= defaultComparison()) as Record<
    string,
    unknown
  >;
  const control = (comparison.control ??= {}) as Record<string, unknown>;
  control.screenshot ??= '';

  const variants = (comparison.variants ?? []) as Array<
    Record<string, unknown>
  >;
  for (const variant of variants) {
    variant.screenshot ??= '';
  }
}

export async function createActivity(): Promise<Activity> {
  const activity = await makeDefaultActivity();
  await db().activities.put(activity);
  localStorage.setItem(CURRENT_KEY, activity.id);
  return activity;
}

// An activity counts as "untouched" if the user hasn't named it yet. Naming
// is the most reliable signal of intent — without it we'd be hard-pressed
// to call the activity their work. In that state we replace its contents
// with the example template so a brand-new user sees a fully-populated
// activity (and a meaningful Generate Specifications PDF) without clicking
// anything. Anyone with a typed name keeps whatever they've started.
function isUntouchedActivity(a: Activity): boolean {
  return a.overview.name.trim() === '';
}

async function applyExampleTo(activity: Activity): Promise<Activity> {
  const example = await makeDefaultActivity();
  return saveActivity({
    ...example,
    id: activity.id,
    createdAt: activity.createdAt,
  });
}

export async function getCurrentActivity(): Promise<Activity> {
  const id = localStorage.getItem(CURRENT_KEY);
  if (id) {
    const existing = await db().activities.get(id);
    if (existing) return existing;
  }
  return createActivity();
}

export async function saveActivity(activity: Activity): Promise<Activity> {
  const next: Activity = { ...activity, updatedAt: new Date().toISOString() };
  await db().activities.put(next);
  return next;
}

// Strict-mode double-invocation in dev can fire the bootstrap effect twice
// before the first createActivity resolves. Without this guard, both runs
// race and write two example activities. We share the in-flight promise so
// the second caller awaits the same creation.
let pendingCreate: Promise<Activity> | null = null;

export function useCurrentActivity(): Activity | undefined {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let currentId = localStorage.getItem(CURRENT_KEY);
      let existing: Activity | undefined;
      if (currentId) {
        existing = await db().activities.get(currentId);
        if (!existing) currentId = null;
      }
      if (!currentId) {
        if (!pendingCreate) {
          pendingCreate = createActivity().finally(() => {
            pendingCreate = null;
          });
        }
        const created = await pendingCreate;
        currentId = created.id;
      } else if (existing && isUntouchedActivity(existing)) {
        // First-time landing on an empty activity — populate with example
        // data so the experience is meaningful out of the box.
        await applyExampleTo(existing);
      }
      if (!cancelled) setId(currentId);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return useLiveQuery(() => (id ? db().activities.get(id) : undefined), [id]);
}

export function isSectionComplete(
  activity: Activity | undefined,
  section: SectionId,
): boolean {
  if (!activity) return false;
  switch (section) {
    case 'overview':
      return activity.overview.name.trim().length > 0;
    case 'hypothesis': {
      const h = activity.hypothesis;
      const allFiveFilled = [
        h.currentState,
        h.change,
        h.outcome,
        h.reasoning,
        h.audienceScope,
      ].every((f) => f.trim().length > 0);
      return allFiveFilled && activity.metrics.primary !== null;
    }
    case 'sample-size': {
      const i = activity.sampleSize.inputs;
      return i.baselineRate > 0 && i.mde > 0 && i.dailyTraffic > 0;
    }
    case 'audience': {
      const a = activity.audience;
      if (!a) return false;
      return (
        a.description.trim().length > 0 &&
        a.targetingRules.trim().length > 0 &&
        a.segmentValidated
      );
    }
    case 'feasibility': {
      const f = activity.feasibility;
      if (!f) return false;
      return f.implementationMethod !== '' && f.trackingValidated;
    }
    case 'comparison': {
      const c = activity.comparison;
      if (!c?.variants) return false;
      return c.variants.some(
        (v) =>
          v.name.trim().length > 0 && v.description.trim().length > 0,
      );
    }
    case 'qa': {
      const items = activity.qa?.items;
      if (!items) return false;
      return QA_ITEMS.every((item) => items[item.id] === true);
    }
    case 'launch': {
      const l = activity.launch;
      if (!l?.items) return false;
      const allChecked = LAUNCH_ITEMS.every(
        (item) => l.items[item.id] === true,
      );
      return allChecked && (l.launchDate ?? '').trim().length > 0;
    }
    case 'evaluation': {
      const e = activity.evaluation;
      if (!e) return false;
      return e.outcome !== '' && e.recommendedNextStep.trim().length > 0;
    }
    case 'value-realisation': {
      const v = activity.valueRealisation;
      if (!v) return false;
      return v.driverValue > 0 && v.changePercent !== 0 && v.valuationValue > 0;
    }
    case 'archive':
      return activity.archive?.status === 'archived';
    case 'specifications':
      return (activity.specifications?.generatedAt ?? '').trim().length > 0;
    default:
      return false;
  }
}
