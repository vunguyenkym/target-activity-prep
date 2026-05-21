'use client';

import { jsPDF } from 'jspdf';
import type { Activity } from './storage';
import { LAUNCH_ITEMS, QA_ITEMS } from './checklists';
import { registerPdfFonts } from './pdf-fonts';
import {
  CONTENT_WIDTH,
  COLORS,
  PAGE,
  TYPE,
  drawFooter,
  drawRule,
  drawSectionLabel,
  drawTile,
  drawWrappedText,
  setFont,
} from './pdf-style';

export async function generateSpecificationPdf(
  activity: Activity,
): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  await registerPdfFonts(doc);

  let y: number = PAGE.marginY;
  y = drawHeader(doc, activity, y);
  y = drawHypothesis(doc, activity, y);
  y = drawMetricsAndSampleSize(doc, activity, y);
  y = drawAudienceFeasibility(doc, activity, y);
  y = drawComparison(doc, activity, y);
  y = drawQaSummary(doc, activity, y);
  drawLaunchSummary(doc, activity, y);
  drawFooter(
    doc,
    `Adobe Target Activity Prep · Specifications · ${new Date().toLocaleString()}`,
    activity.id.slice(0, 8),
  );

  return doc.output('blob');
}

function drawHeader(doc: jsPDF, a: Activity, y: number): number {
  const { overview } = a;
  setFont(doc, 'bold', TYPE.title);
  doc.setTextColor(COLORS.ink);
  doc.text(overview.name || 'Untitled activity', PAGE.marginX, y + 8);

  setFont(doc, 'normal', TYPE.bodySmall);
  doc.setTextColor(COLORS.muted);
  const eyebrow = [overview.activityType || 'Activity', overview.workspace]
    .filter(Boolean)
    .join(' · ');
  if (eyebrow) doc.text(eyebrow, PAGE.marginX, y + 14);

  if (overview.kbo) {
    y = drawWrappedText(
      doc,
      overview.kbo,
      PAGE.marginX,
      y + 22,
      CONTENT_WIDTH,
      TYPE.body,
      COLORS.body,
    );
  } else {
    y += 22;
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
    doc.text(meta, PAGE.marginX, y + 4);
    y += 4;
  }

  y += 4;
  drawRule(doc, y);
  return y + 5;
}

function drawHypothesis(doc: jsPDF, a: Activity, y: number): number {
  if (!a.hypothesis.statement) return y;
  y = drawSectionLabel(doc, 'Hypothesis', y);
  return drawWrappedText(
    doc,
    a.hypothesis.statement,
    PAGE.marginX,
    y,
    CONTENT_WIDTH,
    TYPE.body,
    COLORS.ink,
  ) + 4;
}

function drawMetricsAndSampleSize(
  doc: jsPDF,
  a: Activity,
  y: number,
): number {
  const { outputs, inputs } = a.sampleSize;

  y = drawSectionLabel(doc, 'Sample size & duration', y);
  const tileGap = 3;
  const tileW = (CONTENT_WIDTH - tileGap * 2) / 3;
  const tileH = 16;
  drawTile(doc, PAGE.marginX + (tileW + tileGap) * 0, y, tileW, tileH, 'Per variant', formatNum(outputs.perVariant), 'indigo');
  drawTile(doc, PAGE.marginX + (tileW + tileGap) * 1, y, tileW, tileH, 'Total visitors', formatNum(outputs.total), 'indigo');
  drawTile(doc, PAGE.marginX + (tileW + tileGap) * 2, y, tileW, tileH, 'Days', formatNum(outputs.days), 'indigo');
  y += tileH + 4;

  const inputsLine = [
    `Baseline: ${inputs.baselineRate}%`,
    `MDE: ${inputs.mde}${inputs.mdeType === 'absolute' ? ' pp' : '% relative'}`,
    `Confidence: ${inputs.confidence}%`,
    `Power: ${inputs.power}%`,
    `Variants: ${inputs.variants}`,
    `Daily traffic: ${formatNum(inputs.dailyTraffic)}`,
  ].join('   ·   ');
  setFont(doc, 'normal', TYPE.caption);
  doc.setTextColor(COLORS.muted);
  doc.text(inputsLine, PAGE.marginX, y);
  y += 6;

  if (a.metrics.primary || a.metrics.businessSignificanceThreshold) {
    const half = CONTENT_WIDTH / 2 - 3;
    setFont(doc, 'bold', TYPE.statLabel);
    doc.setTextColor(COLORS.muted);
    doc.text('PRIMARY METRIC', PAGE.marginX, y, { charSpace: 0.6 });
    doc.text(
      'BUSINESS SIGNIFICANCE',
      PAGE.marginX + half + 6,
      y,
      { charSpace: 0.6 },
    );
    setFont(doc, 'normal', TYPE.body);
    doc.setTextColor(COLORS.ink);
    const primaryText = a.metrics.primary?.name ?? '—';
    const bstText = a.metrics.businessSignificanceThreshold || '—';
    doc.text(doc.splitTextToSize(primaryText, half), PAGE.marginX, y + 4);
    doc.text(
      doc.splitTextToSize(bstText, half),
      PAGE.marginX + half + 6,
      y + 4,
    );
    y += 12;
  }

  return y;
}

function drawAudienceFeasibility(
  doc: jsPDF,
  a: Activity,
  y: number,
): number {
  y = drawSectionLabel(doc, 'Audience & feasibility', y);
  const colW = CONTENT_WIDTH / 2 - 3;

  setFont(doc, 'bold', TYPE.statLabel);
  doc.setTextColor(COLORS.muted);
  doc.text('AUDIENCE', PAGE.marginX, y, { charSpace: 0.6 });
  doc.text('FEASIBILITY', PAGE.marginX + colW + 6, y, { charSpace: 0.6 });

  const audienceText = a.audience.description || a.audience.targetingRules || '—';
  const feasibilityText = [
    a.feasibility.implementationMethod &&
      `Method: ${formatImplementation(a.feasibility.implementationMethod)}`,
    a.feasibility.domStability && `DOM stability: ${a.feasibility.domStability}`,
    a.feasibility.integrations.length > 0 &&
      `Integrations: ${a.feasibility.integrations.map(formatIntegration).join(', ')}`,
    `Tracking ${a.feasibility.trackingValidated ? 'validated' : 'pending'}`,
  ]
    .filter(Boolean)
    .join('. ');

  setFont(doc, 'normal', TYPE.body);
  doc.setTextColor(COLORS.body);
  const audienceLines = doc.splitTextToSize(audienceText, colW);
  const feasibilityLines = doc.splitTextToSize(feasibilityText, colW);
  doc.text(audienceLines, PAGE.marginX, y + 4);
  doc.text(feasibilityLines, PAGE.marginX + colW + 6, y + 4);

  const used =
    Math.max(audienceLines.length, feasibilityLines.length) * 3.7 + 6;
  return y + used;
}

function drawComparison(doc: jsPDF, a: Activity, y: number): number {
  y = drawSectionLabel(doc, 'Experience comparison', y);

  const entries = [
    {
      label: a.comparison.control.name || 'Control',
      description: a.comparison.control.description,
      screenshot: a.comparison.control.screenshot,
    },
    ...a.comparison.variants.map((v, i) => ({
      label: v.name || `Variant ${i + 1}`,
      description: v.description,
      screenshot: v.screenshot,
    })),
  ];

  const colCount = Math.min(entries.length, 4);
  const gap = 4;
  // Mockups are 1000×600 (5:3). To preserve aspect always, we anchor on a
  // fixed image height and derive the cell width from it, then centre the
  // row within the content area.
  const imgH = 28;
  const cellW = imgH * (1000 / 600);
  const rowWidth = cellW * colCount + gap * (colCount - 1);
  const xStart = PAGE.marginX + Math.max(0, (CONTENT_WIDTH - rowWidth) / 2);

  for (let i = 0; i < colCount; i++) {
    const x = xStart + i * (cellW + gap);
    const entry = entries[i];

    // Subtle frame so screenshots have a defined edge even on white.
    doc.setDrawColor(COLORS.rule);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, cellW, imgH, 1.5, 1.5);

    if (entry.screenshot) {
      try {
        doc.addImage(entry.screenshot, 'JPEG', x, y, cellW, imgH, undefined, 'FAST');
      } catch {
        drawImagePlaceholder(doc, x, y, cellW, imgH);
      }
    } else {
      drawImagePlaceholder(doc, x, y, cellW, imgH);
    }

    setFont(doc, 'bold', TYPE.bodySmall);
    doc.setTextColor(COLORS.ink);
    doc.text(entry.label, x, y + imgH + 4.5);

    setFont(doc, 'normal', TYPE.caption);
    doc.setTextColor(COLORS.muted);
    const descLines = doc.splitTextToSize(entry.description || '—', cellW);
    doc.text(descLines.slice(0, 3), x, y + imgH + 8.5);
  }

  return y + imgH + 8.5 + 12;
}

function drawQaSummary(doc: jsPDF, a: Activity, y: number): number {
  y = drawSectionLabel(doc, 'QA checklist', y);
  return drawChecklist(
    doc,
    y,
    QA_ITEMS.map((item) => ({
      label: item.label,
      checked: a.qa?.items?.[item.id] === true,
    })),
  );
}

function drawLaunchSummary(doc: jsPDF, a: Activity, y: number): number {
  y = drawSectionLabel(doc, 'Launch checklist', y);
  return drawChecklist(
    doc,
    y,
    LAUNCH_ITEMS.map((item) => ({
      label: item.label,
      checked: a.launch?.items?.[item.id] === true,
    })),
  );
}

function drawChecklist(
  doc: jsPDF,
  y: number,
  items: { label: string; checked: boolean }[],
): number {
  const colCount = 2;
  const gap = 6;
  const colW = (CONTENT_WIDTH - gap) / colCount;
  const rowsPerCol = Math.ceil(items.length / colCount);
  const lineHeight = 4.2;
  setFont(doc, 'normal', TYPE.caption);
  for (let i = 0; i < items.length; i++) {
    const col = Math.floor(i / rowsPerCol);
    const row = i % rowsPerCol;
    const x = PAGE.marginX + col * (colW + gap);
    const rowY = y + row * lineHeight;
    drawCheckbox(doc, x, rowY - 2.4, items[i].checked);
    doc.setTextColor(items[i].checked ? COLORS.ink : COLORS.muted);
    doc.text(items[i].label, x + 4.2, rowY);
  }
  return y + rowsPerCol * lineHeight + 2;
}

function drawCheckbox(
  doc: jsPDF,
  x: number,
  y: number,
  checked: boolean,
): void {
  const size = 2.6;
  doc.setDrawColor(checked ? COLORS.ink : COLORS.muted);
  doc.setLineWidth(0.2);
  if (checked) {
    doc.setFillColor(COLORS.ink);
    doc.roundedRect(x, y, size, size, 0.4, 0.4, 'F');
    // small check tick
    doc.setDrawColor('#FFFFFF');
    doc.setLineWidth(0.35);
    doc.line(x + 0.6, y + 1.4, x + 1.15, y + size - 0.5);
    doc.line(x + 1.15, y + size - 0.5, x + size - 0.45, y + 0.55);
  } else {
    doc.roundedRect(x, y, size, size, 0.4, 0.4);
  }
}

function drawImagePlaceholder(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  doc.setDrawColor(COLORS.rule);
  doc.setFillColor(COLORS.surface);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, 'FD');
  setFont(doc, 'normal', TYPE.caption);
  doc.setTextColor(COLORS.muted);
  doc.text('no screenshot', x + w / 2, y + h / 2 + 1, { align: 'center' });
}

function formatNum(n: number): string {
  return n > 0 ? n.toLocaleString() : '—';
}

function formatImplementation(m: string): string {
  switch (m) {
    case 'vec':
      return 'Visual Experience Composer';
    case 'form-based':
      return 'Form-based composer';
    case 'custom-code':
      return 'Custom code';
    case 'recommendations':
      return 'Recommendations';
    default:
      return m;
  }
}

function formatIntegration(i: string): string {
  const map: Record<string, string> = {
    a4t: 'A4T',
    aam: 'AAM',
    cdp: 'RTCDP',
    aem: 'AEM',
    campaign: 'Campaign',
    ajo: 'AJO',
    other: 'Other',
  };
  return map[i] ?? i;
}
