import {
  CalendarX,
  Clock,
  Code2,
  Layers2,
  MousePointerClick,
  ScrollText,
  ShieldAlert,
  Timer,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import {
  ExperienceLeagueLink,
  KnowledgeCard,
} from '@/components/knowledge-card';

export default function PitfallsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Knowledge · Reference"
        title="Common Pitfalls"
        description="Eight failure modes that quietly burn weeks of testing effort. Worth scanning before every launch and again before declaring a winner."
      />

      <div className="space-y-4">
        <KnowledgeCard
          icon={Timer}
          title="Peeking and early stopping"
          subtitle="Calling a winner before the planned run length inflates your false-positive rate."
        >
          <p>
            The sample-size math assumes one read at the end. Each interim
            check adds chances to randomly cross the significance line. Teams
            that peek and stop early routinely ship variants that look great
            on day five and revert to flat by month two.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Clock}
          title="Underpowered tests"
          subtitle="A flat result on too-small a sample is not evidence of no effect."
        >
          <p>
            If your test lacked the sample size to detect your MDE, a flat
            outcome means you don&apos;t know — not that the change is neutral.
            Re-running with a tighter MDE or longer duration is usually the
            right call before retiring the idea.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={MousePointerClick}
          title="Engagement ≠ business value"
          subtitle="A clickier element that doesn't convert is noise, not a win."
        >
          <p>
            CTR went up but conversion didn&apos;t? That&apos;s not always a
            win — sometimes it&apos;s a more clickable element that pulls
            attention without changing purchase behaviour. Pair every
            mid-funnel metric with the downstream one that actually matters.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Layers2}
          title="Audience overlap"
          subtitle="Concurrent tests on the same traffic can contaminate each other."
        >
          <p>
            If another activity is running on overlapping audiences at the
            same time, lifts can flow between them in either direction.
            Coordinate with the other activity owner, stagger your runs, or
            explicitly exclude their audience from yours.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={CalendarX}
          title="Seasonality and external events"
          subtitle="Black Friday, a press cycle, or a launch elsewhere will skew your numbers."
        >
          <p>
            Anything that shifts traffic mix or intent during the run will
            show up in your metric. Check the calendar before launch, and if
            something big lands mid-test, document it — you may need to throw
            the result out or extend.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={ShieldAlert}
          title="Forgotten guardrails"
          subtitle="A winner that breaks something else isn't necessarily a winner."
        >
          <p>
            A variant that lifts conversion but also bumps page-load time,
            error rate, or support tickets isn&apos;t a clean win. Decide
            what you wouldn&apos;t ship even for a lift — latency, accessibility
            regressions, downstream churn — and watch those metrics
            alongside the primary.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Code2}
          title="Heavy DOM manipulation"
          subtitle="VEC activities on fragile markup break silently — and your control gets corrupted."
        >
          <p>
            Pages with frequent layout changes, dynamic IDs, or heavy SPA
            rerenders will eventually invalidate your VEC selectors. The
            variant stops applying, or worse, applies inconsistently, and
            you don&apos;t notice until results look weird. Lean toward
            form-based composer or custom code on high-risk pages.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={ScrollText}
          title="Skipping compliance review"
          subtitle="Retrofitting compliance after launch creates rework — sometimes a lot of it."
        >
          <p>
            Regulated industries — financial services, health, super, telco —
            often need legal or compliance sign-off on disclaimers, consent
            language, or contact-frequency rules before a variant goes live.
            Pulling it in at the design stage costs minutes; pulling it in
            after launch can cost a re-run.
          </p>
        </KnowledgeCard>
      </div>

      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/activities/activity-qa/activity-qa" />
    </div>
  );
}
