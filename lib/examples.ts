// Randomised example scenarios. Each Load Example click picks a scenario at
// random and shuffles numeric values within sensible ranges, so users always
// see plausible but fresh content instead of the same fixed numbers.

import type {
  ActivityType,
  MetricType,
  ValueImpactType,
} from './storage';

type Range = readonly [number, number];

export type ExampleScenario = {
  name: string;
  activityType: ActivityType;
  context: string;
  kbo: string;
  audienceScope: string;
  currentStateTemplate: string; // {baseline} placeholder
  change: string;
  outcome: string;
  reasoning: string;
  primaryMetric: { type: MetricType; name: string };
  secondaryMetrics: { type: MetricType; name: string }[];
  businessSignificanceThreshold: string;
  sampleSize: {
    baselineRatePct: Range;
    mdePctRelative: Range;
    dailyTraffic: Range;
    variants: number;
  };
  expectedLiftNarrative: string;
  audience: {
    description: string;
    targetingRules: string;
    exclusionRules: string;
  };
  feasibility: {
    implementationMethod: 'vec' | 'form-based' | 'custom-code' | 'recommendations';
    domStability: 'low' | 'medium' | 'high';
    integrations: ('a4t' | 'aam' | 'cdp' | 'aem' | 'campaign' | 'ajo' | 'other')[];
    blockersNotes: string;
  };
  comparison: {
    controlName: string;
    controlDescription: string;
    variantName: string;
    variantDescription: string;
  };
  qaNotes: string;
  evaluationExample: {
    observedLift: string;
    observedLiftPercentRange: Range;
    businessImpact: string;
    technicalIssues: string;
    significanceCall: string;
    recommendedNextStep: string;
  };
  keyFindingsPool: string[];
  valueRealisation: {
    driverLabel: string;
    changeLabel: string;
    valuationLabel: string;
    valuationRange: Range;
    impactType: ValueImpactType;
    methodologyNotes: string;
    caveats: string;
  };
};

export const OWNER_POOL = [
  'Sarah · Personalisation Strategist',
  'Marco · Optimisation Lead',
  'Priya · CRO Specialist',
  'Jordan · Growth Strategist',
  'Lin · Senior Test Manager',
];

export const APPROVER_POOL = [
  'Alex · Head of Growth',
  'Dana · VP Marketing',
  'Rohan · Director of Product',
  'Casey · Head of Acquisition',
  'Sam · Director of Optimisation',
];

export const WORKSPACE_POOL = [
  'Default Workspace',
  'APAC Web',
  'EMEA Web',
  'Brand-X Conversion',
  'Growth Lab',
];

export const SCENARIOS: ExampleScenario[] = [
  {
    name: 'Spring promo banner test (Example)',
    activityType: 'A/B',
    context:
      'Stakeholders want a clean comparison of personalised vs evergreen hero on the homepage before scaling. Q2 growth target depends on lifting click-through into the promo collection.',
    kbo:
      'Lift clicks into the promo collection from organic homepage traffic to support Q2 acquisition goals.',
    audienceScope:
      'organic homepage visitors on desktop and mobile with at least one prior session',
    currentStateTemplate:
      'The homepage shows an evergreen hero banner that converts at roughly {baseline}% CTR for organic visitors.',
    change:
      'replacing the static hero with a personalised promo banner that adapts to the visitor’s recent browsing categories',
    outcome:
      'higher click-through into the promo collection and more downstream conversions from organic homepage traffic',
    reasoning:
      'prior promo banners on category pages lifted CTR by ~12% with similar audiences, and personalised content tends to outperform evergreen on returning traffic',
    primaryMetric: { type: 'ctr', name: 'Click-through rate' },
    secondaryMetrics: [{ type: 'conversion_rate', name: 'Conversion rate' }],
    businessSignificanceThreshold:
      '+2% absolute CTR sustained for 4 weeks, with no degradation in conversion rate.',
    sampleSize: {
      baselineRatePct: [3, 6],
      mdePctRelative: [8, 14],
      dailyTraffic: [3500, 8000],
      variants: 2,
    },
    expectedLiftNarrative:
      'A modest, sustained lift in homepage engagement that compounds through the funnel.',
    audience: {
      description:
        'Organic homepage visitors with at least one prior session in the last 30 days.',
      targetingRules:
        'URL is the homepage; profile parameter session_count >= 1; entry channel = organic.',
      exclusionRules:
        'Internal staff (cookie is_staff = true); visitors qualified for an overlapping activity.',
    },
    feasibility: {
      implementationMethod: 'vec',
      domStability: 'medium',
      integrations: ['a4t', 'aam'],
      blockersNotes:
        'Hero DOM is reasonably stable; one open dependency on the data team to expose category_affinity as an mbox parameter.',
    },
    comparison: {
      controlName: 'Evergreen hero',
      controlDescription:
        'Current static promo banner — single image with a generic CTA ("Shop the season").',
      variantName: 'Personalised hero',
      variantDescription:
        'Hero image and copy adapt to the visitor’s recent browsing category — e.g., "Continue your home-decor refresh".',
    },
    qaNotes:
      'Tested across Chrome / Safari / Firefox on desktop and iOS. Mbox trace clean, audience qualification verified for both logged-in and anonymous returning visitors.',
    evaluationExample: {
      observedLift:
        '+11.2% relative on click-through into the promo collection, sustained over the full run.',
      observedLiftPercentRange: [8, 14],
      businessImpact:
        'Annualised incremental click-throughs flow into a meaningful uplift at current AOV.',
      technicalIssues:
        'None significant. Variant rendered consistently across Chrome / Safari / Firefox on desktop and iOS.',
      significanceCall:
        'Statistically significant at 95% confidence. Lift exceeds the +2% threshold we set, so worth shipping.',
      recommendedNextStep:
        'Ship the personalised hero to 100% next sprint; queue an iteration testing copy variants on the secondary CTA.',
    },
    keyFindingsPool: [
      'Personalisation by recent-browsing category was the bigger lever vs copy variation. Lift held across desktop and mobile, with returning visitors showing the largest relative gain. Next iteration should sequence on hero copy and secondary CTAs.',
      'The mobile uplift outpaced desktop by roughly half — visitor intent on smaller screens is more sensitive to personalised cues. Worth focusing the next iteration on the mobile path.',
      'New visitors showed only a modest lift; returning visitors carried the result. The signal is strongest in the 3+ session cohort, confirming the prior-session targeting was load-bearing.',
      'Lift came predominantly from organic traffic; paid social cohorts moved within noise. Recommend keeping the variant scoped to organic for now and re-testing on paid traffic separately.',
    ],
    valueRealisation: {
      driverLabel: 'Annual conversions at baseline',
      changeLabel: 'Incremental conversion uplift',
      valuationLabel: 'Average order value (AUD)',
      valuationRange: [30, 55],
      impactType: 'incremental-revenue',
      methodologyNotes:
        'Baseline conversions = daily homepage traffic × baseline CTR × 365 days. Incremental uplift mirrors the planned MDE; revise against observed lift post-launch. AOV pulled from analytics, trailing 90 days.',
      caveats:
        'Annualised figure assumes the lift is sustained for the next 12 months. Recalibrate quarterly against observed performance and update AOV from latest analytics.',
    },
  },
  {
    name: 'Checkout urgency CTA test (Example)',
    activityType: 'A/B',
    context:
      'Cart abandonment at the checkout review step has been flat for two quarters. Soft urgency messaging is a quick lever to test before redesigning the full step.',
    kbo:
      'Reduce cart abandonment on the checkout review step for first-time buyers.',
    audienceScope:
      'first-time buyers reaching the checkout review step in the last 30 days',
    currentStateTemplate:
      'The checkout review step shows a neutral "Place order" button; completion rate from this step is roughly {baseline}%.',
    change:
      'adding a low-pressure urgency cue next to the place-order button — "Stock confirmed for the next 10 minutes"',
    outcome:
      'fewer abandoned checkouts and more completed orders from first-time buyers',
    reasoning:
      'soft scarcity messaging has lifted checkout completion ~6–10% in prior tests on comparable segments, with no observed downstream return-rate impact',
    primaryMetric: { type: 'conversion_rate', name: 'Conversion rate' },
    secondaryMetrics: [{ type: 'aov', name: 'Average order value' }],
    businessSignificanceThreshold:
      '+3% absolute lift in checkout completion sustained for 4 weeks, with no rise in returns or chargebacks.',
    sampleSize: {
      baselineRatePct: [38, 55],
      mdePctRelative: [4, 9],
      dailyTraffic: [800, 2200],
      variants: 2,
    },
    expectedLiftNarrative:
      'A small but consistent lift in checkout completion that holds across device classes.',
    audience: {
      description:
        'First-time buyers reaching the checkout review step in the last 30 days, across desktop and mobile.',
      targetingRules:
        'URL contains /checkout/review; profile parameter purchase_count = 0; not opted out of marketing.',
      exclusionRules:
        'Returning customers; B2B accounts; visitors in any concurrent pricing or checkout activity.',
    },
    feasibility: {
      implementationMethod: 'custom-code',
      domStability: 'low',
      integrations: ['a4t', 'cdp'],
      blockersNotes:
        'Checkout markup is stable. Confirm urgency string passes content review with brand and compliance before launch.',
    },
    comparison: {
      controlName: 'Neutral place-order CTA',
      controlDescription:
        'Existing checkout review with a plain "Place order" button and no urgency messaging.',
      variantName: 'Stock-confirmed urgency',
      variantDescription:
        'Place-order button paired with a small "Stock confirmed for the next 10 minutes" cue under the price summary.',
    },
    qaNotes:
      'QA pass on staging + smoke on production. Verified urgency string disappears at the 10-minute mark; analytics events fire for both variants on completion and abandonment.',
    evaluationExample: {
      observedLift:
        '+6.4% relative on checkout completion for first-time buyers over the run.',
      observedLiftPercentRange: [4, 8],
      businessImpact:
        'Annualised incremental completed orders at current AOV is meaningful; supports the quarterly revenue plan.',
      technicalIssues:
        'Minor rendering latency on iOS Safari during week 2 (cache invalidation), resolved without affecting significance.',
      significanceCall:
        'Statistically significant at 95% confidence. Lift sustained for 4 weeks and exceeds the +3% absolute threshold.',
      recommendedNextStep:
        'Roll out the urgency CTA to all first-time buyers; A/B test stronger urgency variants next quarter.',
    },
    keyFindingsPool: [
      'Urgency messaging works on first-time buyers but only at the checkout review step — earlier-funnel placements failed in prior tests. Watch return rates over the next 60 days.',
      'Mobile showed the larger relative lift, likely because urgency is more visible on the card-based small-screen layout. Desktop carried lower but consistent gains.',
      'The urgency cue converted visitors with cart values in the mid-band most reliably; very-high-cart users moved within noise. Consider segmenting the variant for sustained rollout.',
      'iOS Safari (where cookie persistence is weakest) showed smaller lift than Android / Chrome, but still positive. Worth instrumenting for a post-launch comparison.',
    ],
    valueRealisation: {
      driverLabel: 'Annual completed checkouts (baseline)',
      changeLabel: 'Incremental completion uplift',
      valuationLabel: 'Average order value (AUD)',
      valuationRange: [65, 130],
      impactType: 'incremental-revenue',
      methodologyNotes:
        'Baseline completions = daily checkout review traffic × baseline completion rate × 365 days. Uplift modelled on planned MDE; AOV pulled from finance, trailing 6 months.',
      caveats:
        'Watch for downstream return rate — urgency messaging can lift completion but compress decision quality. Recalibrate after 30 days post-launch.',
    },
  },
  {
    name: 'Pricing tier emphasis test (Example)',
    activityType: 'A/B',
    context:
      'The Pro tier carries the highest revenue per signup but its current share of new paid signups is below benchmark. Visual emphasis is a low-cost lever to test before a full pricing redesign.',
    kbo:
      'Increase the share of paid signups choosing the recommended Pro tier.',
    audienceScope:
      'free-trial visitors viewing the pricing page who have used the product for at least 7 days',
    currentStateTemplate:
      'The pricing page shows three tiers (Starter, Pro, Team) with equal weight; about {baseline}% of conversions select Pro.',
    change:
      'visually emphasising the Pro tier with a "Most popular" badge, a larger card, and an accent border',
    outcome:
      'higher share of paid signups choosing Pro instead of Starter, lifting annual contract value per new customer',
    reasoning:
      'social proof and visual hierarchy reliably shift tier choice on comparable pricing experiences without changing total signup volume',
    primaryMetric: { type: 'conversion_rate', name: 'Conversion rate' },
    secondaryMetrics: [{ type: 'custom', name: 'Pro-tier share of paid signups' }],
    businessSignificanceThreshold:
      '+5 percentage-point lift in Pro-tier share, sustained for 8 weeks, with no drop in total signup volume.',
    sampleSize: {
      baselineRatePct: [20, 35],
      mdePctRelative: [6, 12],
      dailyTraffic: [600, 1800],
      variants: 2,
    },
    expectedLiftNarrative:
      'A clear lift in Pro-tier share that translates to higher annual contract value.',
    audience: {
      description:
        'Free-trial visitors viewing the pricing page after 7+ days of product usage, on desktop or mobile.',
      targetingRules:
        'URL contains /pricing; profile parameter trial_age_days >= 7; not flagged as a renewal lead.',
      exclusionRules:
        'Existing paid customers; enterprise sales-led prospects; visitors in concurrent pricing activities.',
    },
    feasibility: {
      implementationMethod: 'form-based',
      domStability: 'low',
      integrations: ['a4t', 'aem'],
      blockersNotes:
        'Pricing components live in AEM; coordinate with the marketing engineering team to expose the "Most popular" variant of the card.',
    },
    comparison: {
      controlName: 'Equal-weight tiers',
      controlDescription:
        'Current pricing page — three tiers laid out with equal visual weight and no badges.',
      variantName: 'Pro emphasised',
      variantDescription:
        'Pro card scaled up by ~15%, with a "Most popular" badge and an accent-coloured border.',
    },
    qaNotes:
      'QA passed across desktop and mobile. Verified scaling does not break responsive layout at 320px width; Pro selection events fire correctly via A4T.',
    evaluationExample: {
      observedLift:
        '+8.1 percentage-point lift in Pro-tier share of paid signups, sustained over 8 weeks.',
      observedLiftPercentRange: [6, 11],
      businessImpact:
        "Material annualised increase in ACV per new customer; supports the renewal team's quarterly target.",
      technicalIssues:
        'None significant — pricing components are stable in AEM and the variant scaled responsively across breakpoints.',
      significanceCall:
        'Statistically significant at 95% confidence. Lift exceeds the +5pp threshold and total signup volume held steady.',
      recommendedNextStep:
        "Roll out the 'Most popular' emphasis to all free-trial visitors at 7+ days. Queue a follow-up test on a 'Team' tier badge.",
    },
    keyFindingsPool: [
      'Visual hierarchy moves tier choice without depressing total signup volume — a clean, low-risk win. Consider extending the same pattern to a "Team" tier emphasis for accounts above 5 seats.',
      'The shift was strongest among 14–21 day trial visitors; sub-7-day cohorts moved less, suggesting the badge resonates more with users who have evaluated the product longer.',
      'Desktop users responded more strongly to the visual emphasis than mobile — the larger card real estate amplifies the hierarchy cue. Consider a mobile-specific iteration with sharper badge contrast.',
      'The Pro lift came from former Starter selectors, not from new traffic. Net effect is upgrade rather than acquisition — finance should model this as ACV uplift, not signup volume.',
    ],
    valueRealisation: {
      driverLabel: 'Annual paid signups (baseline)',
      changeLabel: 'Pro-tier share lift',
      valuationLabel: 'Pro vs Starter annual contract delta (AUD)',
      valuationRange: [220, 420],
      impactType: 'incremental-revenue',
      methodologyNotes:
        'Baseline annual paid signups derived from daily pricing-page traffic × baseline conversion × 365. Uplift mirrors the planned tier-share MDE. Valuation = Pro ACV minus Starter ACV from finance, current FY.',
      caveats:
        'Assumes total signup volume holds steady — monitor for any drop in Starter conversions, which would offset the value of Pro lift.',
    },
  },
];

// ---- Randomisation helpers -------------------------------------------------

export function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number, decimals = 1): number {
  const v = Math.random() * (max - min) + min;
  const mult = Math.pow(10, decimals);
  return Math.round(v * mult) / mult;
}

export function pickRange(r: Range, decimals = 1): number {
  return randFloat(r[0], r[1], decimals);
}

export function pickRangeInt(r: Range): number {
  return randInt(r[0], r[1]);
}

// ISO yyyy-mm-dd, offset days from today.
export function isoDateOffsetDays(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
