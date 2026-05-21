import type { MdeType, Metric, MetricType } from './storage';

export const METRIC_TYPES: MetricType[] = [
  'conversion_rate',
  'rpv',
  'aov',
  'ctr',
  'form_completion',
  'video_engagement',
  'custom',
];

export const METRIC_LABELS: Record<MetricType, string> = {
  conversion_rate: 'Conversion rate',
  rpv: 'Revenue per visitor',
  aov: 'Average order value',
  ctr: 'Click-through rate',
  form_completion: 'Form completion rate',
  video_engagement: 'Video engagement',
  custom: 'Custom',
};

export const METRIC_INFO: Record<MetricType, string> = {
  conversion_rate:
    "Share of visitors who complete a target action — purchase, signup, click. Best for headline business outcomes. Skip when the action is rare enough that you can't realistically hit the sample size in the available window.",
  rpv:
    "Revenue per visitor — total revenue divided by visitor count. Captures both conversion and order value, so it's the cleanest top-line measure when you have transactional revenue. Skip on non-transactional pages.",
  aov:
    'Average order value — revenue divided by number of orders. Use when you specifically want to influence basket size: bundles, upsells, free-shipping thresholds. Not a great fit if the variation also changes who decides to buy.',
  ctr:
    "Click-through rate on a specific element. Good for evaluating creative or layout changes on a page. Don't use as a sole primary — clicks rarely translate one-to-one to downstream value.",
  form_completion:
    'Share of visitors who finish a form once they start it. Use for signup, lead capture, application flows. Pair with a downstream metric if the form is mid-funnel — a faster form that completes worse downstream is a loss.',
  video_engagement:
    'Watch-through or interaction rate on a video. Use when video is the conversion event itself. Skip when video is decorative — engagement rarely connects to business outcomes.',
  custom:
    "Anything else specific to your activity — a custom event, a derived ratio, a downstream KPI. Use sparingly; you should be able to explain in one sentence why the existing types don't fit.",
};

export function composeStatement(args: {
  audienceScope: string;
  change: string;
  outcome: string;
  reasoning: string;
  primaryName: string | null;
  mde: number;
  mdeType: MdeType;
  days: number;
}): string {
  const audience = lowerClause(args.audienceScope) || '[audienceScope]';
  const change = lowerClause(args.change) || '[change]';
  const outcome = lowerClause(args.outcome) || '[outcome]';
  const reasoning = lowerClause(args.reasoning) || '[reasoning]';
  const metricName = args.primaryName?.trim() || '[primary metric]';

  const mdeStr =
    Number.isFinite(args.mde) && args.mde > 0
      ? `${formatMdeValue(args.mde)}${args.mdeType === 'absolute' ? ' pp' : '% relative'}`
      : '[MDE]';

  const durationStr = args.days > 0 ? String(args.days) : '[duration]';

  return `For ${audience}, we believe that ${change} will result in ${outcome} because ${reasoning}. We will know this is true when ${metricName} moves by ${mdeStr} over ${durationStr} days.`;
}

// Strips trailing sentence punctuation and lowercases the first character so
// user-typed clauses slot into the template ("For X, we believe that Y will
// result in Z because W.") without producing artefacts like "session., we
// believe that Replace…"
function lowerClause(s: string): string {
  const trimmed = s.trim().replace(/[.,;:!?\s]+$/, '');
  if (!trimmed) return '';
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function formatMdeValue(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export function metricFromType(type: MetricType, previousName?: string): Metric {
  if (type === 'custom') {
    return { type, name: previousName ?? '', description: '' };
  }
  return { type, name: METRIC_LABELS[type], description: '' };
}
