// Imports a Target activity from a JSON file into the single local
// activity slot. Drop-in for the local-first / single-activity model.
//
// Bindings reconciled against lib/storage.ts:
//   - makeBlankActivity (the actual export name; was createBlankActivity)
//   - setCurrentActivityId (helper added so we don't hardcode the
//     localStorage key here)
//   - saveActivity (canonical upsert; advances updatedAt)

import {
  type Activity,
  makeBlankActivity,
  saveActivity,
  setCurrentActivityId,
} from './storage';

export type ImportResult =
  | { ok: true; activity: Activity }
  | { ok: false; error: string };

function looksLikeActivity(value: unknown): value is Partial<Activity> {
  return typeof value === 'object' && value !== null && 'overview' in value;
}

// Merge incoming JSON onto a complete blank activity so the result is
// always schema-complete, even when the JSON omits fields. The blank's
// fresh id and createdAt are kept; any id/timestamps in the JSON are
// ignored. saveActivity() advances updatedAt on write.
function mergeOntoBlank(
  blank: Activity,
  incoming: Partial<Activity>,
): Activity {
  return {
    ...blank,
    overview: { ...blank.overview, ...(incoming.overview ?? {}) },
    hypothesis: { ...blank.hypothesis, ...(incoming.hypothesis ?? {}) },
    metrics: { ...blank.metrics, ...(incoming.metrics ?? {}) },
    sampleSize: {
      ...blank.sampleSize,
      ...(incoming.sampleSize ?? {}),
      inputs: {
        ...blank.sampleSize.inputs,
        ...(incoming.sampleSize?.inputs ?? {}),
      },
      outputs: {
        ...blank.sampleSize.outputs,
        ...(incoming.sampleSize?.outputs ?? {}),
      },
      sensitivity:
        incoming.sampleSize?.sensitivity ?? blank.sampleSize.sensitivity,
    },
    audience: { ...blank.audience, ...(incoming.audience ?? {}) },
    feasibility: { ...blank.feasibility, ...(incoming.feasibility ?? {}) },
    comparison: { ...blank.comparison, ...(incoming.comparison ?? {}) },
    qa: { ...blank.qa, ...(incoming.qa ?? {}) },
    launch: { ...blank.launch, ...(incoming.launch ?? {}) },
    evaluation: { ...blank.evaluation, ...(incoming.evaluation ?? {}) },
    valueRealisation: {
      ...blank.valueRealisation,
      ...(incoming.valueRealisation ?? {}),
    },
    archive: { ...blank.archive, ...(incoming.archive ?? {}) },
    specifications: {
      ...blank.specifications,
      ...(incoming.specifications ?? {}),
    },
    // id / createdAt intentionally kept from `blank`.
  };
}

export async function importActivityFromJson(
  jsonText: string,
): Promise<ImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  if (!looksLikeActivity(parsed)) {
    return {
      ok: false,
      error:
        "This doesn't look like a Target activity export (no 'overview' section).",
    };
  }

  try {
    const blank = makeBlankActivity(); // fresh id + timestamps + full v7 shape
    const activity = mergeOntoBlank(blank, parsed);

    setCurrentActivityId(activity.id);
    await saveActivity(activity); // canonical write path

    return { ok: true, activity };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Import failed.',
    };
  }
}
