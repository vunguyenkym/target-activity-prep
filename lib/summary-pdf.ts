'use client';

import { jsPDF } from 'jspdf';
import type { Activity } from './storage';
import { registerPdfFonts } from './pdf-fonts';
import {
  CONTENT_WIDTH,
  COLORS,
  PAGE,
  TYPE,
  drawFooterOnAllPages,
  drawRule,
  drawSectionLabel,
  drawTile,
  drawWrappedText,
  ensureSpace,
  loadImageMeta,
  setFont,
} from './pdf-style';
import {
  VALUE_IMPACT_LABELS,
  computeValueImpact,
  formatCurrency,
  formatNumber,
} from './value-realisation';

const OUTCOME_LABEL: Record<string, string> = {
  won: 'Won',
  lost: 'Lost',
  inconclusive: 'Inconclusive',
};

export async function generateActivitySummaryPdf(
  activity: Activity,
): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  await registerPdfFonts(doc);

  // Pre-load screenshot dimensions in parallel so we can render at the
  // actual aspect ratios. The Summary shows control + first variant in
  // the comparison row, plus an optional A4T dashboard shot.
  const comparisonScreens = [
    activity.comparison.control.screenshot,
    ...activity.comparison.variants.slice(0, 1).map((v) => v.screenshot),
  ];
  const [comparisonMetas, a4tMeta] = await Promise.all([
    Promise.all(
      comparisonScreens.map((s) =>
        s ? loadImageMeta(s) : Promise.resolve(null),
      ),
    ),
    activity.evaluation.a4tScreenshot
      ? loadImageMeta(activity.evaluation.a4tScreenshot)
      : Promise.resolve(null),
  ]);

  let y: number = PAGE.marginY;
  y = drawHeader(doc, activity, y);
  y = drawHypothesisBreakdown(doc, activity, y);
  y = drawPlannedVsActual(doc, activity, y);
  y = drawComparison(doc, activity, y, comparisonMetas);
  y = drawValueRealisation(doc, activity, y);
  y = drawA4tScreenshot(doc, activity, y, a4tMeta);
  drawKeyFindings(doc, activity, y);
  drawFooterOnAllPages(
    doc,
    `Adobe Target Activity Prep · Summary · ${new Date().toLocaleString()}`,
    activity.id.slice(0, 8),
  );
  return doc.output('blob');
}

function drawHeader(doc: jsPDF, a: Activity, y: number): number {
  const { overview } = a;

  setFont(doc, 'normal', TYPE.sectionLabel);
  doc.setTextColor(COLORS.muted);
  doc.text('ACTIVITY SUMMARY', PAGE.marginX, y + 2, { charSpace: 0.8 });

  setFont(doc, 'bold', TYPE.title);
  doc.setTextColor(COLORS.ink);
  // Wrap long activity titles instead of clipping the right edge.
  const titleLines = doc.splitTextToSize(
    overview.name || 'Untitled activity',
    CONTENT_WIDTH,
  );
  const titleLineHeight = TYPE.title * 0.42;
  doc.text(titleLines, PAGE.marginX, y + 9);
  const extraTitleH = (titleLines.length - 1) * titleLineHeight;
  y += extraTitleH;

  setFont(doc, 'normal', TYPE.bodySmall);
  doc.setTextColor(COLORS.muted);
  const eyebrow = [overview.activityType, overview.workspace]
    .filter(Boolean)
    .join(' · ');
  if (eyebrow) doc.text(eyebrow, PAGE.marginX, y + 14);

  if (overview.kbo) {
    y = drawWrappedText(
      doc,
      overview.kbo,
      PAGE.marginX,
      y + 20,
      CONTENT_WIDTH,
      TYPE.body,
      COLORS.body,
    );
  } else {
    y += 20;
  }

  const meta = [
    overview.owner && `Owner: ${overview.owner}`,
    overview.approver && `Approver: ${overview.approver}`,
    overview.startDate && `Start: ${overview.startDate}`,
    overview.endDate && `End: ${overview.endDate}`,
  ]
    .filter(Boolean)
    .join('   ·   ');
  if (meta) {
    setFont(doc, 'normal', TYPE.caption);
    doc.setTextColor(COLORS.muted);
    doc.text(meta, PAGE.marginX, y + 3.5);
    y += 3.5;
  }
  y += 3;
  drawRule(doc, y);
  return y + 4;
}

function drawHypothesisBreakdown(
  doc: jsPDF,
  a: Activity,
  y: number,
): number {
  const h = a.hypothesis;
  if (
    !h.audienceScope &&
    !h.change &&
    !h.outcome &&
    !h.reasoning &&
    !h.statement
  ) {
    return y;
  }
  // Pre-measure so the breakdown block can break onto a fresh page if
  // the hypothesis prose is unusually long.
  y = ensureSpace(doc, y, 60);
  y = drawSectionLabel(doc, 'Hypothesis', y);

  const rows: { label: string; text: string }[] = [
    { label: 'For', text: h.audienceScope },
    { label: 'We believe that', text: h.change },
    { label: 'Will result in', text: h.outcome },
    { label: 'Because', text: h.reasoning },
    {
      label: 'We know this when',
      text:
        a.metrics.primary && a.sampleSize.outputs.days > 0
          ? `${a.metrics.primary.name} moves by ${a.sampleSize.inputs.mde}${a.sampleSize.inputs.mdeType === 'absolute' ? ' pp' : '% relative'} over ${a.sampleSize.outputs.days} days`
          : '—',
    },
  ];

  // Label column needs to comfortably fit "WE KNOW THIS WHEN" at the bold
  // statLabel size — the previous 30mm width with charSpace 0.5 caused the
  // label to bleed into the value column. 44mm + tighter spacing keeps a
  // clear gutter between the label and the prose.
  const labelColW = 44;
  const gutter = 3;
  const valueColW = CONTENT_WIDTH - labelColW - gutter;
  const lineH = TYPE.body * 0.42;
  for (const row of rows) {
    if (!row.text) continue;
    setFont(doc, 'bold', TYPE.statLabel);
    doc.setTextColor(COLORS.muted);
    doc.text(row.label.toUpperCase(), PAGE.marginX, y + 2.5, {
      charSpace: 0.3,
    });
    setFont(doc, 'normal', TYPE.body);
    doc.setTextColor(COLORS.ink);
    const lines = doc.splitTextToSize(row.text, valueColW);
    doc.text(lines, PAGE.marginX + labelColW + gutter, y + 2.5);
    y += Math.max(lineH, lines.length * lineH) + 2.2;
  }
  return y + 2;
}

function drawPlannedVsActual(doc: jsPDF, a: Activity, y: number): number {
  y = ensureSpace(doc, y, 70);
  y = drawSectionLabel(doc, 'Planned vs actual', y);

  // Outcome chip — right-aligned on the section's first row, since outcome
  // is the headline of this section and shouldn't fight a tile for space.
  if (a.evaluation.outcome) {
    drawOutcomeChip(doc, a, PAGE.width - PAGE.marginX, y - 5);
  }

  const colGap = 6;
  const colW = (CONTENT_WIDTH - colGap) / 2;

  // Column heads — slightly stronger ink and clear separation between
  // PLANNED and ACTUAL.
  setFont(doc, 'bold', TYPE.statLabel + 0.5);
  doc.setTextColor(COLORS.ink);
  doc.text('PLANNED', PAGE.marginX, y, { charSpace: 0.6 });
  doc.text('ACTUAL', PAGE.marginX + colW + colGap, y, { charSpace: 0.6 });

  setFont(doc, 'normal', TYPE.caption - 0.5);
  doc.setTextColor(COLORS.muted);
  doc.text('Sample-size check', PAGE.marginX + 19, y, { charSpace: 0.2 });
  doc.text('Evaluation read', PAGE.marginX + colW + colGap + 17, y, {
    charSpace: 0.2,
  });
  y += 4;

  // Two tiles per column — Per variant + Planned duration / Observed lift
  // + Actual duration. Each column gets a clear visual identity (indigo
  // for planned, green-leaning for actual when won).
  const tileGap = 2;
  const tileW = (colW - tileGap) / 2;
  const tileH = 14;

  drawTile(
    doc,
    PAGE.marginX,
    y,
    tileW,
    tileH,
    'Per variant',
    a.sampleSize.outputs.perVariant > 0
      ? formatNumber(a.sampleSize.outputs.perVariant)
      : '—',
    'indigo',
  );
  drawTile(
    doc,
    PAGE.marginX + tileW + tileGap,
    y,
    tileW,
    tileH,
    'Planned duration',
    a.sampleSize.outputs.days > 0
      ? `${a.sampleSize.outputs.days} days`
      : '—',
    'indigo',
  );

  const actualX = PAGE.marginX + colW + colGap;
  const liftTone: 'green' | 'orange' | 'teal' =
    a.evaluation.outcome === 'won'
      ? 'green'
      : a.evaluation.outcome === 'lost'
        ? 'orange'
        : 'teal';
  drawTile(
    doc,
    actualX,
    y,
    tileW,
    tileH,
    'Observed lift',
    a.evaluation.observedLiftPercent !== 0
      ? `${a.evaluation.observedLiftPercent > 0 ? '+' : ''}${a.evaluation.observedLiftPercent}%`
      : '—',
    liftTone,
  );
  drawTile(
    doc,
    actualX + tileW + tileGap,
    y,
    tileW,
    tileH,
    'Actual duration',
    a.evaluation.actualDays > 0 ? `${a.evaluation.actualDays} days` : '—',
    liftTone,
  );
  y += tileH + 3;

  // Secondary stats under each column — kept tight and aligned to the
  // column gutter.
  const inputs = a.sampleSize.inputs;
  const plannedLine = [
    `Baseline ${inputs.baselineRate}%`,
    `MDE ${inputs.mde}${inputs.mdeType === 'absolute' ? ' pp' : '% rel'}`,
    `Variants ${inputs.variants}`,
  ].join('  ·  ');
  const actualSummary = a.evaluation.observedLift || '—';
  const actualLine = a.evaluation.confidenceLevel > 0
    ? `${a.evaluation.confidenceLevel}% confidence  ·  ${actualSummary}`
    : actualSummary;

  setFont(doc, 'normal', TYPE.caption);
  doc.setTextColor(COLORS.muted);
  const plannedLines = doc.splitTextToSize(plannedLine, colW);
  const actualLines = doc.splitTextToSize(actualLine, colW);
  doc.text(plannedLines.slice(0, 2), PAGE.marginX, y);
  doc.text(actualLines.slice(0, 2), actualX, y);

  y += Math.max(plannedLines.length, actualLines.length) * 3.2 + 5;

  if (a.evaluation.recommendedNextStep) {
    setFont(doc, 'bold', TYPE.statLabel);
    doc.setTextColor(COLORS.muted);
    doc.text('RECOMMENDED NEXT STEP', PAGE.marginX, y, { charSpace: 0.6 });
    y =
      drawWrappedText(
        doc,
        a.evaluation.recommendedNextStep,
        PAGE.marginX,
        y + 3.5,
        CONTENT_WIDTH,
        TYPE.body,
        COLORS.ink,
      ) + 2;
  }
  return y;
}

// Small status chip rendered right-aligned to anchor x. Subtle fill so it
// reads as a status badge, not a tile.
function drawOutcomeChip(
  doc: jsPDF,
  a: Activity,
  rightX: number,
  y: number,
): void {
  const label = OUTCOME_LABEL[a.evaluation.outcome] || '';
  if (!label) return;
  const palette: { fill: string; ink: string } =
    a.evaluation.outcome === 'won'
      ? { fill: '#e6f4ec', ink: '#15803d' }
      : a.evaluation.outcome === 'lost'
        ? { fill: '#fdf0e6', ink: '#c2410c' }
        : { fill: '#eef1ff', ink: '#3730a3' };
  setFont(doc, 'bold', TYPE.statLabel);
  const labelText = label.toUpperCase();
  const padX = 2.5;
  const w = doc.getTextWidth(labelText) + padX * 2 + 0.6;
  const h = 4.2;
  const x = rightX - w;
  doc.setFillColor(palette.fill);
  doc.setDrawColor(palette.fill);
  doc.roundedRect(x, y - h + 1.2, w, h, 1.2, 1.2, 'F');
  doc.setTextColor(palette.ink);
  doc.text(labelText, x + padX, y - 0.4, { charSpace: 0.6 });
}

function drawComparison(
  doc: jsPDF,
  a: Activity,
  y: number,
  metas: ({ w: number; h: number } | null)[],
): number {
  const entries = [
    {
      label: a.comparison.control.name || 'Control',
      description: a.comparison.control.description,
      screenshot: a.comparison.control.screenshot,
    },
    ...a.comparison.variants.slice(0, 1).map((v, i) => ({
      label: v.name || `Variant ${i + 1}`,
      description: v.description,
      screenshot: v.screenshot,
    })),
  ];

  const colCount = entries.length;
  const gap = 4;
  // Equal-width cells. Each image then fits within its cell at its real
  // aspect ratio — vertical mobile screenshots stay slim and centred;
  // landscape screenshots fill the cell width.
  const cellW = (CONTENT_WIDTH - gap * (colCount - 1)) / colCount;
  const maxImgH = 90;
  const fallbackAspect = 1000 / 600;

  type Slot = { displayW: number; displayH: number; hasImage: boolean };
  const slots: Slot[] = entries.map((entry, i) => {
    const meta = entry.screenshot ? metas[i] : null;
    const aspect = meta ? meta.w / meta.h : fallbackAspect;
    let displayW = cellW;
    let displayH = cellW / aspect;
    if (displayH > maxImgH) {
      displayH = maxImgH;
      displayW = maxImgH * aspect;
    }
    return { displayW, displayH, hasImage: !!entry.screenshot };
  });
  const rowImageH = Math.max(...slots.map((s) => s.displayH));

  y = ensureSpace(doc, y, rowImageH + 22);
  y = drawSectionLabel(doc, 'Experience comparison', y);

  for (let i = 0; i < colCount; i++) {
    const cellX = PAGE.marginX + i * (cellW + gap);
    const slot = slots[i];
    const entry = entries[i];
    const imgX = cellX + (cellW - slot.displayW) / 2;
    doc.setDrawColor(COLORS.rule);
    doc.setLineWidth(0.2);
    doc.roundedRect(imgX, y, slot.displayW, slot.displayH, 1.5, 1.5);
    if (slot.hasImage && entry.screenshot) {
      try {
        doc.addImage(
          entry.screenshot,
          'JPEG',
          imgX,
          y,
          slot.displayW,
          slot.displayH,
          undefined,
          'FAST',
        );
      } catch {
        drawPlaceholder(doc, imgX, y, slot.displayW, slot.displayH);
      }
    } else {
      drawPlaceholder(doc, imgX, y, slot.displayW, slot.displayH);
    }
    setFont(doc, 'bold', TYPE.bodySmall);
    doc.setTextColor(COLORS.ink);
    doc.text(entry.label, cellX, y + rowImageH + 3.5);

    setFont(doc, 'normal', TYPE.caption);
    doc.setTextColor(COLORS.muted);
    const descLines = doc.splitTextToSize(entry.description || '—', cellW);
    doc.text(descLines.slice(0, 3), cellX, y + rowImageH + 7);
  }

  return y + rowImageH + 14;
}

function drawValueRealisation(doc: jsPDF, a: Activity, y: number): number {
  const v = a.valueRealisation;
  const impact = computeValueImpact(v);
  y = ensureSpace(doc, y, 45);
  y = drawSectionLabel(doc, 'Value realisation', y);

  // 4 letter-only tiles so the user's long labels don't overflow.
  const gap = 3;
  const tileW = (CONTENT_WIDTH - gap * 3) / 4;
  const tileH = 16;
  const tones: ('blue' | 'orange' | 'teal' | 'green')[] = [
    'blue',
    'orange',
    'teal',
    'green',
  ];
  const letters = ['A', 'B', 'C', 'D'];
  const values = [
    formatNumber(v.driverValue),
    `${v.changePercent}%`,
    formatCurrency(v.valuationValue),
    formatCurrency(impact),
  ];
  const captions = [
    v.driverLabel || 'Driver',
    v.changeLabel || 'Change',
    v.valuationLabel || 'Valuation',
    `${VALUE_IMPACT_LABELS[v.impactType]} (annualised)`,
  ];
  for (let i = 0; i < 4; i++) {
    drawTile(
      doc,
      PAGE.marginX + i * (tileW + gap),
      y,
      tileW,
      tileH,
      letters[i],
      values[i],
      tones[i],
    );
  }
  y += tileH + 2;

  // Caption row under tiles — user labels wrap to 2 lines if needed.
  setFont(doc, 'normal', TYPE.caption);
  doc.setTextColor(COLORS.muted);
  for (let i = 0; i < 4; i++) {
    const x = PAGE.marginX + i * (tileW + gap);
    const lines = doc.splitTextToSize(captions[i], tileW);
    doc.text(lines.slice(0, 2), x, y + 3);
  }
  y += 9;

  setFont(doc, 'normal', TYPE.caption);
  doc.setTextColor(COLORS.muted);
  doc.text(
    `${formatNumber(v.driverValue)}  ×  ${v.changePercent}%  ×  ${formatCurrency(v.valuationValue)}  =  ${formatCurrency(impact)} per year`,
    PAGE.marginX,
    y,
  );
  return y + 4;
}

function drawA4tScreenshot(
  doc: jsPDF,
  a: Activity,
  y: number,
  meta: { w: number; h: number } | null,
): number {
  const screenshot = a.evaluation.a4tScreenshot;
  if (!screenshot) return y;
  // Honour the screenshot's real aspect. Default to 16:9 only when we
  // couldn't load metadata. Cap height at half a page so a very tall
  // shot doesn't dominate the page.
  const aspect = meta ? meta.w / meta.h : 16 / 9;
  const maxH = 130;
  let w = CONTENT_WIDTH;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  y = ensureSpace(doc, y, h + 12);
  y = drawSectionLabel(doc, 'A4T dashboard', y);
  const x = PAGE.marginX + (CONTENT_WIDTH - w) / 2;
  try {
    doc.addImage(screenshot, 'JPEG', x, y, w, h, undefined, 'FAST');
  } catch {
    drawPlaceholder(doc, x, y, w, h);
  }
  return y + h + 3;
}

function drawKeyFindings(doc: jsPDF, a: Activity, y: number) {
  const findings = a.archive.keyFindings.trim();
  if (!findings) return;
  setFont(doc, 'normal', TYPE.body);
  const lines = doc.splitTextToSize(findings, CONTENT_WIDTH);
  y = ensureSpace(doc, y, 10 + lines.length * (TYPE.body * 0.42));
  y = drawSectionLabel(doc, 'Key findings', y);
  drawWrappedText(
    doc,
    findings,
    PAGE.marginX,
    y,
    CONTENT_WIDTH,
    TYPE.body,
    COLORS.ink,
  );
}

// -- Helpers ----------------------------------------------------------------

function drawPlaceholder(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  doc.setFillColor(COLORS.surface);
  doc.setDrawColor(COLORS.rule);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, 'FD');
  setFont(doc, 'normal', TYPE.caption);
  doc.setTextColor(COLORS.muted);
  doc.text('no screenshot', x + w / 2, y + h / 2 + 1, { align: 'center' });
}
