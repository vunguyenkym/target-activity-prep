// Two abstract hero mockups baked into the example activity so the
// Generate Specifications PDF has real visuals out of the box. Each SVG
// is rendered to a JPEG data URL via canvas at activity creation time.

const CONTROL_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600">
  <rect width="1000" height="600" fill="#f8fafc"/>
  <!-- header -->
  <rect x="0" y="0" width="1000" height="64" fill="#ffffff"/>
  <line x1="0" y1="64" x2="1000" y2="64" stroke="#e2e8f0"/>
  <rect x="32" y="22" width="120" height="20" rx="3" fill="#cbd5e1"/>
  <rect x="220" y="26" width="48" height="12" rx="3" fill="#e2e8f0"/>
  <rect x="284" y="26" width="48" height="12" rx="3" fill="#e2e8f0"/>
  <rect x="348" y="26" width="48" height="12" rx="3" fill="#e2e8f0"/>
  <rect x="412" y="26" width="48" height="12" rx="3" fill="#e2e8f0"/>
  <circle cx="950" cy="32" r="12" fill="#e2e8f0"/>
  <!-- hero block -->
  <rect x="32" y="100" width="936" height="380" rx="10" fill="#e2e8f0"/>
  <rect x="80" y="180" width="420" height="36" rx="4" fill="#94a3b8"/>
  <rect x="80" y="234" width="380" height="14" rx="3" fill="#cbd5e1"/>
  <rect x="80" y="256" width="340" height="14" rx="3" fill="#cbd5e1"/>
  <rect x="80" y="278" width="280" height="14" rx="3" fill="#cbd5e1"/>
  <rect x="80" y="340" width="170" height="44" rx="6" fill="#0f172a"/>
  <text x="165" y="368" font-family="system-ui,sans-serif" font-size="16" fill="#ffffff" text-anchor="middle" font-weight="600">Shop the season</text>
  <!-- footer rule -->
  <rect x="32" y="520" width="160" height="14" rx="3" fill="#e2e8f0"/>
  <rect x="32" y="544" width="100" height="12" rx="3" fill="#e2e8f0"/>
  <!-- label -->
  <rect x="32" y="76" width="86" height="18" rx="9" fill="#0f172a"/>
  <text x="75" y="89" font-family="system-ui,sans-serif" font-size="10" fill="#ffffff" text-anchor="middle" font-weight="700">CONTROL</text>
</svg>`;

const VARIANT_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fde68a"/>
      <stop offset="0.55" stop-color="#fb923c"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="600" fill="#fafaf9"/>
  <!-- header -->
  <rect x="0" y="0" width="1000" height="64" fill="#ffffff"/>
  <line x1="0" y1="64" x2="1000" y2="64" stroke="#e2e8f0"/>
  <rect x="32" y="22" width="120" height="20" rx="3" fill="#cbd5e1"/>
  <rect x="220" y="26" width="48" height="12" rx="3" fill="#e2e8f0"/>
  <rect x="284" y="26" width="48" height="12" rx="3" fill="#e2e8f0"/>
  <rect x="348" y="26" width="48" height="12" rx="3" fill="#e2e8f0"/>
  <rect x="412" y="26" width="48" height="12" rx="3" fill="#e2e8f0"/>
  <circle cx="950" cy="32" r="12" fill="#e2e8f0"/>
  <!-- personalisation chip -->
  <rect x="32" y="80" width="240" height="24" rx="12" fill="#fef3c7" stroke="#f59e0b"/>
  <circle cx="48" cy="92" r="4" fill="#f59e0b"/>
  <text x="158" y="96" font-family="system-ui,sans-serif" font-size="11" fill="#92400e" text-anchor="middle" font-weight="600">PERSONALISED FOR RETURNING VISITORS</text>
  <!-- hero block -->
  <rect x="32" y="116" width="936" height="370" rx="10" fill="url(#g)"/>
  <rect x="80" y="172" width="480" height="44" rx="4" fill="#ffffff" opacity="0.95"/>
  <text x="100" y="201" font-family="system-ui,sans-serif" font-size="20" fill="#581c87" font-weight="700">Continue your home-decor refresh</text>
  <rect x="80" y="234" width="400" height="14" rx="3" fill="#ffffff" opacity="0.7"/>
  <rect x="80" y="256" width="360" height="14" rx="3" fill="#ffffff" opacity="0.7"/>
  <rect x="80" y="278" width="300" height="14" rx="3" fill="#ffffff" opacity="0.7"/>
  <rect x="80" y="340" width="220" height="44" rx="6" fill="#5b21b6"/>
  <text x="190" y="368" font-family="system-ui,sans-serif" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="600">Pick up where you left off →</text>
  <!-- recently viewed strip -->
  <rect x="80" y="406" width="100" height="60" rx="6" fill="#ffffff" opacity="0.85"/>
  <rect x="192" y="406" width="100" height="60" rx="6" fill="#ffffff" opacity="0.85"/>
  <rect x="304" y="406" width="100" height="60" rx="6" fill="#ffffff" opacity="0.85"/>
  <!-- footer rule -->
  <rect x="32" y="520" width="160" height="14" rx="3" fill="#e2e8f0"/>
  <rect x="32" y="544" width="100" height="12" rx="3" fill="#e2e8f0"/>
  <!-- label -->
  <rect x="876" y="76" width="92" height="18" rx="9" fill="#5b21b6"/>
  <text x="922" y="89" font-family="system-ui,sans-serif" font-size="10" fill="#ffffff" text-anchor="middle" font-weight="700">VARIANT</text>
</svg>`;

async function svgToJpegDataUrl(
  svg: string,
  width: number,
  height: number,
): Promise<string> {
  const encoded = window.btoa(unescape(encodeURIComponent(svg)));
  const svgDataUrl = `data:image/svg+xml;base64,${encoded}`;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Could not decode example mockup SVG'));
    i.src = svgDataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  // White backdrop so JPEG (which has no alpha) doesn't go black where the
  // SVG was transparent.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

let cached: { control: string; variant: string } | null = null;

export async function getExampleMockups(): Promise<{
  control: string;
  variant: string;
}> {
  if (cached) return cached;
  const [control, variant] = await Promise.all([
    svgToJpegDataUrl(CONTROL_SVG, 1000, 600),
    svgToJpegDataUrl(VARIANT_SVG, 1000, 600),
  ]);
  cached = { control, variant };
  return cached;
}
