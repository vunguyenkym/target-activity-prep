import {
  Briefcase,
  CheckCircle2,
  Database,
  PercentCircle,
  Scale,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import {
  ExperienceLeagueLink,
  KnowledgeCard,
  KnowledgeNote,
} from '@/components/knowledge-card';
import { SectionLabel } from '@/components/section-label';

export default function PrioritizationPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Knowledge · Reference"
        title="Prioritization Framework"
        description="A weighted model for ranking the activity backlog. Score each candidate against the four factors below, then apply the operating constraints to land on the actual queue."
      />

      <section className="space-y-4">
        <SectionLabel icon={Scale} tone="primary">
          Score the candidate
        </SectionLabel>

        <KnowledgeCard
          icon={Briefcase}
          title="Business impact"
          subtitle="Expected revenue, conversion, or KBO-linked outcome at full traffic."
        >
          <p>
            The most important factor. Estimate the lift &times; reach &times;
            value of a conversion at full traffic. A 1% lift on the checkout
            page usually beats a 10% lift on a low-traffic landing page —
            don&apos;t let percentage points fool you.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Wrench}
          title="Technical complexity"
          subtitle="Effort to implement, including DOM stability and integration dependencies."
        >
          <p>
            Heavy DOM manipulation, integration dependencies, or custom code
            should lower priority unless the impact justifies the cost. Easy
            wins beat hero projects when the backlog is long.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Database}
          title="Data readiness"
          subtitle="Are the audiences, traits, and tracking already in place?"
        >
          <p>
            Activities that need new audiences in RTCDP, new mbox parameters,
            or new analytics events take weeks longer than the build itself.
            Score down anything that depends on data work that hasn&apos;t
            started.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={ShieldCheck}
          title="Regulatory sensitivity"
          subtitle="Compliance review surface area — disclaimers, consent, contact frequency."
        >
          <p>
            In regulated industries, anything that changes messaging, contact
            cadence, or data usage needs early legal/compliance sign-off. High
            sensitivity adds calendar time even when the build is trivial.
          </p>
        </KnowledgeCard>
      </section>

      <section className="space-y-4">
        <SectionLabel icon={CheckCircle2} tone="primary">
          Apply the operating constraints
        </SectionLabel>

        <KnowledgeCard
          icon={PercentCircle}
          title="Reserve 30% capacity for iteration"
          subtitle="Don't book the whole roster on new ideas."
        >
          <p>
            Programs that always launch new activities and never iterate on
            winners leave most of the value on the table. Hold back roughly
            30% of capacity for following up on activities that won, lost
            inconclusively, or hinted at a deeper insight.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={CheckCircle2}
          title="Production-readiness gate"
          subtitle="A short checklist before an activity enters the build queue."
        >
          <KnowledgeNote label="Audience">
            Confirm the audience exists (or can be built) in Adobe Target / RTCDP
            within the activity&apos;s timeline.
          </KnowledgeNote>
          <KnowledgeNote label="Implementation">
            Confirm AEM modular compatibility (or wherever the page lives), so
            the variant build doesn&apos;t hit avoidable DOM-stability risk.
          </KnowledgeNote>
          <KnowledgeNote label="Measurement">
            Confirm the analytics tagging plan covers primary, secondary, and
            guardrail metrics before launch — not after.
          </KnowledgeNote>
        </KnowledgeCard>
      </section>

      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/activities/target-activities-guide" />
    </div>
  );
}
