'use client';

// Floating Feedback button. Appears bottom-right after the user has
// browsed >5 unique pages AND spent >2 minutes in the session. Click
// opens a small dialog with a textarea; submissions land in the
// IndexedDB feedback table (lib/storage.ts). Server-side delivery is
// not wired up yet — that's a deliberate phase-2 piece.

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { saveFeedback } from '@/lib/storage';

const PAGE_THRESHOLD = 5; // strict ">", so the user must visit at least 6 pages
const TIME_THRESHOLD_MS = 2 * 60 * 1000;
const SESSION_START_KEY = 'tap.feedback.sessionStart';
const PAGES_KEY = 'tap.feedback.pagesVisited';
const CHECK_INTERVAL_MS = 10_000;

function readPages(): string[] {
  try {
    const raw = sessionStorage.getItem(PAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((p): p is string => typeof p === 'string')
      : [];
  } catch {
    return [];
  }
}

function getSessionStart(): number {
  const raw = sessionStorage.getItem(SESSION_START_KEY);
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  const now = Date.now();
  sessionStorage.setItem(SESSION_START_KEY, String(now));
  return now;
}

export function FeedbackButton() {
  const pathname = usePathname();
  const [eligible, setEligible] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const checkEligibility = useCallback(() => {
    if (typeof window === 'undefined') return;
    const pages = readPages();
    const start = getSessionStart();
    const elapsed = Date.now() - start;
    setEligible((prev) => {
      const next =
        pages.length > PAGE_THRESHOLD && elapsed > TIME_THRESHOLD_MS;
      // Sticky — once eligible, stay eligible until a fresh tab.
      return prev || next;
    });
  }, []);

  // Track unique pages as the user navigates.
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    const pages = readPages();
    if (!pages.includes(pathname)) {
      pages.push(pathname);
      sessionStorage.setItem(PAGES_KEY, JSON.stringify(pages));
    }
    // Ensure the session start is anchored on first render too.
    getSessionStart();
    checkEligibility();
  }, [pathname, checkEligibility]);

  // Periodic re-check so the time threshold can flip while the user
  // stays on a single page without navigating.
  useEffect(() => {
    if (eligible) return;
    const interval = window.setInterval(checkEligibility, CHECK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [eligible, checkEligibility]);

  const close = () => {
    setOpen(false);
    setSubmitted(false);
  };

  const submit = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await saveFeedback({
        page: pathname ?? '/',
        message: trimmed,
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent.slice(0, 200),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      });
      setMessage('');
      setSubmitted(true);
      window.setTimeout(close, 1800);
    } finally {
      setSubmitting(false);
    }
  };

  if (!eligible) return null;

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Send feedback"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg ring-1 ring-primary/30 transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        <MessageSquare className="size-4" strokeWidth={2} aria-hidden />
        Feedback
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Send feedback"
      className="animate-in fade-in slide-in-from-bottom-2 fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-border bg-card p-4 shadow-2xl"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Send feedback</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
            {pathname ?? '/'}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {submitted ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Thanks — saved locally for now.
        </p>
      ) : (
        <>
          <Textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's working, what's confusing, what would you change?"
            className="text-sm"
            autoFocus
            maxLength={1000}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[10px] text-muted-foreground">
              Stored locally · no server yet
            </p>
            <Button
              type="button"
              size="sm"
              onClick={submit}
              disabled={!message.trim() || submitting}
            >
              <Send className="size-3.5" />
              {submitting ? 'Saving…' : 'Send'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
