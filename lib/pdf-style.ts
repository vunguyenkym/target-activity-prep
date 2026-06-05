// Shared minimalist style for both the Specifications and Activity
// Summary PDFs. Restrained palette, generous whitespace, single accent.
//
// Note on fonts: jsPDF's built-in Helvetica is the closest match to the
// app's Plus Jakarta Sans without bundling a TTF (~80 KB) and registering
// it through addFileToVFS. Helvetica is a humanist sans in the same
// family — the minimalism comes from layout discipline more than from
// the exact letterforms.

import type { jsPDF } from 'jspdf';
import { PDF_FONT_FAMILY } from './pdf-fonts';

export const PAGE = {
  width: 210,
  height: 297,
  marginX: 18,
  marginY: 18,
} as const;

export const CONTENT_WIDTH = PAGE.width - PAGE.marginX * 2;

export const COLORS = {
  ink: '#0a0a0a',
  body: '#262626',
  muted: '#737373',
  rule: '#e5e5e5',
  surface: '#fafafa',
  accent: '#0a0a0a', // restrained — section labels stay ink, accent reserved for brand mark
  brand: '#FA0F00',
} as const;

// Tonal palette for stat tiles. Chosen to read clearly on white with the
// dark ink text used in this PDF. Each tile gets a soft fill + tinted ink.
export const TILE_TONES = {
  indigo: { fill: '#eef1ff', ink: '#3730a3' },
  blue: { fill: '#e6f1fb', ink: '#1d4ed8' },
  orange: { fill: '#fdf0e6', ink: '#c2410c' },
  teal: { fill: '#e0f5f3', ink: '#0f766e' },
  green: { fill: '#e6f4ec', ink: '#15803d' },
} as const;

export type TileTone = keyof typeof TILE_TONES;

// All sizes scaled to ~80% of the previous design to fit more content on
// one page while keeping the visual hierarchy.
export const TYPE = {
  title: 18,
  sectionLabel: 6,
  body: 7.5,
  bodySmall: 7,
  caption: 6.5,
  statLabel: 6,
  statValue: 14,
} as const;

export function setFont(
  doc: jsPDF,
  weight: 'normal' | 'bold' = 'normal',
  size?: number,
) {
  try {
    doc.setFont(PDF_FONT_FAMILY, weight);
  } catch {
    doc.setFont('helvetica', weight);
  }
  if (size !== undefined) doc.setFontSize(size);
}

export function drawRule(doc: jsPDF, y: number) {
  doc.setDrawColor(COLORS.rule);
  doc.setLineWidth(0.2);
  doc.line(PAGE.marginX, y, PAGE.width - PAGE.marginX, y);
}

export function drawSectionLabel(doc: jsPDF, label: string, y: number): number {
  // Small Adobe-red accent block to anchor each section, followed by a
  // slightly larger inked label and a hairline rule that runs the full
  // content width. Gives every section a clean header without heavy boxes.
  const accentSize = 2.2;
  doc.setFillColor(COLORS.brand);
  doc.rect(PAGE.marginX, y - accentSize + 0.6, accentSize, accentSize, 'F');

  setFont(doc, 'bold', 8);
  doc.setTextColor(COLORS.ink);
  doc.text(label.toUpperCase(), PAGE.marginX + accentSize + 2, y, {
    charSpace: 0.8,
  });

  doc.setDrawColor(COLORS.rule);
  doc.setLineWidth(0.2);
  doc.line(PAGE.marginX, y + 2, PAGE.width - PAGE.marginX, y + 2);
  return y + 7;
}

export function drawBrandMark(doc: jsPDF, x: number, y: number, size = 6) {
  // The Adobe-red square used in the app sidebar.
  doc.setFillColor(COLORS.brand);
  doc.roundedRect(x, y, size, size, 0.6, 0.6, 'F');
  doc.setFillColor('#FFFFFF');
  const tx = x + size / 2;
  const ty1 = y + size * 0.32;
  const ty2 = y + size * 0.78;
  // Triangle inside the red square
  doc.triangle(
    tx,
    ty1,
    x + size * 0.85,
    ty2,
    x + size * 0.15,
    ty2,
    'F',
  );
}

export function drawFooter(
  doc: jsPDF,
  left: string,
  right: string,
) {
  const y = PAGE.height - 10;
  drawBrandMark(doc, PAGE.marginX, y - 5);
  setFont(doc, 'normal', 7.5);
  doc.setTextColor(COLORS.muted);
  doc.text(left, PAGE.marginX + 9, y - 1);
  doc.text(right, PAGE.width - PAGE.marginX, y - 1, { align: 'right' });
}

export function drawTile(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  tone: TileTone = 'indigo',
  caption?: string,
) {
  const palette = TILE_TONES[tone];
  doc.setFillColor(palette.fill);
  doc.setDrawColor(palette.fill);
  doc.roundedRect(x, y, w, h, 1.8, 1.8, 'F');

  setFont(doc, 'bold', TYPE.statLabel);
  doc.setTextColor(palette.ink);
  doc.text(label.toUpperCase(), x + 3.5, y + 4.5, { charSpace: 0.5 });

  setFont(doc, 'bold', TYPE.statValue);
  doc.setTextColor(palette.ink);
  // Right-align if the value would otherwise blow past the tile width.
  const valueWidth = doc.getTextWidth(value);
  const maxValueWidth = w - 7;
  if (valueWidth > maxValueWidth) {
    setFont(doc, 'bold', TYPE.statValue - 4);
  }
  doc.text(value, x + 3.5, y + h - 4);

  if (caption) {
    setFont(doc, 'normal', TYPE.caption - 1);
    doc.setTextColor(palette.ink);
    const lines = doc.splitTextToSize(caption, w - 7);
    doc.text(lines.slice(0, 1), x + 3.5, y + h - 1);
  }
}

export function drawSectionFrame(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  doc.setFillColor(COLORS.surface);
  doc.setDrawColor(COLORS.rule);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
}

// Bottom margin to leave clear for the footer (~18 mm gives the brand
// mark + footer text breathing room). Anything that would land in this
// strip triggers a page break.
const FOOTER_RESERVED = 22;

// Page-break helper. Call before drawing a block to ensure it fits on
// the current page. Returns the y where the block should start (either
// the current y, or PAGE.marginY on a fresh page).
export function ensureSpace(
  doc: jsPDF,
  currentY: number,
  needed: number,
): number {
  if (currentY + needed > PAGE.height - FOOTER_RESERVED) {
    doc.addPage();
    return PAGE.marginY;
  }
  return currentY;
}

// Reads the intrinsic dimensions of an image (data URL or remote src)
// by loading it into a transient Image element. Used by the PDF
// generators so screenshots render at their true aspect ratio rather
// than being stretched into a fixed-ratio cell.
export function loadImageMeta(
  src: string,
): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !src) {
      resolve(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (w > 0 && h > 0) resolve({ w, h });
      else resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Stamp the footer on every page the document has so far. Call once
// after all content has been drawn — earlier pages would otherwise
// have no footer if the doc spilled past one page.
export function drawFooterOnAllPages(
  doc: jsPDF,
  left: string,
  right: string,
): void {
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    drawFooter(doc, `${left} · p${p}/${pageCount}`, right);
  }
}

export function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number = TYPE.body,
  color: string = COLORS.body,
  weight: 'normal' | 'bold' = 'normal',
): number {
  setFont(doc, weight, size);
  doc.setTextColor(color);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  const lineHeight = size * 0.38;
  return y + lines.length * lineHeight;
}
