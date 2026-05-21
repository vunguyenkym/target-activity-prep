'use client';

import type { jsPDF } from 'jspdf';

let cachedFonts: { regular: string; bold: string } | null = null;
let inflight: Promise<{ regular: string; bold: string }> | null = null;

export const PDF_FONT_FAMILY = 'PlusJakartaSans';

async function fetchAsBase64(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Could not load font from ${url}: ${resp.status}`);
  }
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  // Avoid stack overflow on large buffers — chunk the conversion.
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

async function loadOnce() {
  if (cachedFonts) return cachedFonts;
  if (!inflight) {
    inflight = Promise.all([
      fetchAsBase64('/fonts/PlusJakartaSans-Regular.ttf'),
      fetchAsBase64('/fonts/PlusJakartaSans-Bold.ttf'),
    ])
      .then(([regular, bold]) => {
        cachedFonts = { regular, bold };
        return cachedFonts;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

// Registers Plus Jakarta Sans (Regular + Bold) with the given jsPDF document.
// Safe to call multiple times — the TTFs are cached after the first fetch.
// Falls back silently if the fonts can't be loaded; callers should still
// call setFont('PlusJakartaSans', ...) but jsPDF will resolve to its
// default Helvetica fallback if the font isn't registered.
export async function registerPdfFonts(doc: jsPDF): Promise<void> {
  try {
    const fonts = await loadOnce();
    doc.addFileToVFS('PlusJakartaSans-Regular.ttf', fonts.regular);
    doc.addFont('PlusJakartaSans-Regular.ttf', PDF_FONT_FAMILY, 'normal');
    doc.addFileToVFS('PlusJakartaSans-Bold.ttf', fonts.bold);
    doc.addFont('PlusJakartaSans-Bold.ttf', PDF_FONT_FAMILY, 'bold');
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.warn('PDF font load failed, falling back to Helvetica.', e);
    }
  }
}
