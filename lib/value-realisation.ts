import type { ValueImpactType, ValueRealisation } from './storage';

export const VALUE_IMPACT_OPTIONS: { id: ValueImpactType; label: string }[] = [
  { id: 'incremental-revenue', label: 'Incremental revenue' },
  { id: 'cost-avoidance', label: 'Cost avoidance' },
  { id: 'cost-savings', label: 'Cost savings' },
  { id: 'productivity-gains', label: 'Productivity gains' },
];

export const VALUE_IMPACT_LABELS: Record<ValueImpactType, string> = {
  'incremental-revenue': 'Incremental revenue',
  'cost-avoidance': 'Cost avoidance',
  'cost-savings': 'Cost savings',
  'productivity-gains': 'Productivity gains',
};

// D = A × (B / 100) × C — the Adobe value-realisation equation.
export function computeValueImpact(v: ValueRealisation): number {
  if (
    !Number.isFinite(v.driverValue) ||
    !Number.isFinite(v.changePercent) ||
    !Number.isFinite(v.valuationValue)
  ) {
    return 0;
  }
  return v.driverValue * (v.changePercent / 100) * v.valuationValue;
}

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-AU', { maximumFractionDigits: 2 });
}
