'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/section-label';
import { saveActivity, type Activity } from '@/lib/storage';
import { generateSpecificationPdf } from '@/lib/spec-pdf';
import { QA_ITEMS } from '@/lib/checklists';

export function SpecificationsForm({ activity }: { activity: Activity }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const blob = await generateSpecificationPdf(activity);
      const url = URL.createObjectURL(blob);
      const fileName = sanitizeFileName(activity.overview.name);
      triggerDownload(url, `${fileName}-spec.pdf`);
      URL.revokeObjectURL(url);
      await saveActivity({
        ...activity,
        specifications: { generatedAt: new Date().toISOString() },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(`Could not generate the PDF: ${message}`);
    } finally {
      setGenerating(false);
    }
  };

  const qaDone = QA_ITEMS.filter((i) => activity.qa.items[i.id] === true).length;
  const qaTotal = QA_ITEMS.length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-accent via-card to-card p-5 shadow-sm">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-[oklch(0.65_0.22_320)]"
        />
        <SectionLabel icon={FileText} tone="primary" className="mb-3">
          One-pager preview
        </SectionLabel>
        <p className="text-sm leading-relaxed text-foreground">
          The PDF pulls together everything in Phase 1: activity facts,
          hypothesis statement, primary metric and business-significance
          threshold, sample-size results, audience &amp; feasibility summary,
          comparison cards (with screenshots), and your QA status. One A4
          portrait page, ready to share with your approver.
        </p>
      </section>

      <section className="space-y-3">
        <SectionLabel icon={FileText}>What&apos;s included</SectionLabel>
        <ul className="space-y-1.5 text-sm">
          <Bullet label="Activity name + type + workspace + dates + owner &amp; approver" />
          <Bullet label="Hypothesis statement (composed)" />
          <Bullet label="Primary metric + business-significance threshold" />
          <Bullet label="Sample-size outputs + key inputs" />
          <Bullet label="Audience description + feasibility summary" />
          <Bullet
            label={`Up to 4 experience comparison cards with screenshots (${
              1 + Math.min(activity.comparison.variants.length, 3)
            } available now)`}
          />
          <Bullet label={`QA status (${qaDone} / ${qaTotal} items complete)`} />
        </ul>
      </section>

      <section className="space-y-3">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          size="lg"
        >
          <Download className="size-4" />
          {generating ? 'Generating PDF…' : 'Generate one-pager PDF'}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {activity.specifications.generatedAt && (
          <p className="text-xs text-muted-foreground">
            Last generated{' '}
            {new Date(activity.specifications.generatedAt).toLocaleString()}.
          </p>
        )}
      </section>
    </div>
  );
}

function Bullet({ label }: { label: string }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden className="text-primary">
        •
      </span>
      <span
        className="text-foreground"
        dangerouslySetInnerHTML={{ __html: label }}
      />
    </li>
  );
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'activity';
}

function triggerDownload(href: string, fileName: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
