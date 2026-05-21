import type { Activity } from './storage';

export type SampleSizeInputs = Activity['sampleSize']['inputs'];
export type SampleSizeOutputs = Activity['sampleSize']['outputs'];
export type SensitivityRow = Activity['sampleSize']['sensitivity'][number];

const Z_CONFIDENCE: Record<number, number> = {
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

const Z_POWER: Record<number, number> = {
  80: 0.8416,
  90: 1.2816,
};

export const SENSITIVITY_MULTIPLIERS = [0.5, 0.75, 1, 1.5, 2] as const;

export function computePerVariant(inputs: SampleSizeInputs): number {
  const { baselineRate, mde, mdeType, confidence, power } = inputs;
  if (!Number.isFinite(baselineRate) || !Number.isFinite(mde)) return 0;
  if (baselineRate <= 0 || mde <= 0) return 0;

  const p1 = baselineRate / 100;
  const p2 =
    mdeType === 'absolute' ? p1 + mde / 100 : p1 * (1 + mde / 100);
  if (p2 <= 0 || p2 >= 1 || p2 === p1) return 0;

  const zAlpha = Z_CONFIDENCE[confidence];
  const zBeta = Z_POWER[power];
  if (zAlpha === undefined || zBeta === undefined) return 0;

  const variance = p1 * (1 - p1) + p2 * (1 - p2);
  const denominator = (p2 - p1) ** 2;
  const n = ((zAlpha + zBeta) ** 2 * variance) / denominator;

  return Number.isFinite(n) && n > 0 ? Math.ceil(n) : 0;
}

export function computeOutputs(inputs: SampleSizeInputs): SampleSizeOutputs {
  const perVariant = computePerVariant(inputs);
  const variants = Number.isFinite(inputs.variants) && inputs.variants > 0
    ? Math.floor(inputs.variants)
    : 0;
  const total = perVariant * variants;
  const days =
    inputs.dailyTraffic > 0 && total > 0
      ? Math.ceil(total / inputs.dailyTraffic)
      : 0;
  return { perVariant, total, days };
}

export function computeSensitivity(
  inputs: SampleSizeInputs,
): SensitivityRow[] {
  return SENSITIVITY_MULTIPLIERS.map((m) => {
    const adjusted = { ...inputs, mde: inputs.mde * m };
    const perVariant = computePerVariant(adjusted);
    const total = perVariant * Math.max(0, Math.floor(inputs.variants));
    const days =
      inputs.dailyTraffic > 0 && total > 0
        ? Math.ceil(total / inputs.dailyTraffic)
        : 0;
    return { mdeMultiplier: m, perVariant, days };
  });
}
