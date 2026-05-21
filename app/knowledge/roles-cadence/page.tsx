import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Code,
  Crown,
  Lightbulb,
  Palette,
  Users,
  UsersRound,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import {
  ExperienceLeagueLink,
  KnowledgeCard,
  KnowledgeNote,
} from '@/components/knowledge-card';
import { SectionLabel } from '@/components/section-label';

export default function RolesCadencePage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Knowledge · Reference"
        title="Roles & Cadence"
        description="The smallest set of roles an Adobe Target program needs, and the meeting cadence that keeps them aligned. Tested teams can be three people — just make sure every role has an owner."
      />

      <section className="space-y-4">
        <SectionLabel icon={UsersRound} tone="primary">
          Roles
        </SectionLabel>

        <KnowledgeCard
          icon={Crown}
          title="Executive Sponsor"
          subtitle="Business — owns the why."
        >
          <KnowledgeNote label="Responsibilities">
            Promotes a testing culture, sets program-level priorities through
            steering committees, and removes organisational blockers. Held
            accountable for the program&apos;s business outcomes, not the
            details of individual activities.
          </KnowledgeNote>
          <KnowledgeNote label="When involved">
            Strategy phase + Quarterly steering committee.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Users}
          title="Testing & Personalisation Strategist"
          subtitle="Business — owns the activity portfolio."
        >
          <KnowledgeNote label="Responsibilities">
            Creates optimisation plans with clear objectives and success
            criteria. Works closely with analysts so each activity is
            measurable, and prioritises based on potential value, not
            preference.
          </KnowledgeNote>
          <KnowledgeNote label="When involved">
            Strategy → Prioritise → Design → Build → Analyse.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={BarChart3}
          title="Analyst"
          subtitle="Business — owns the data."
        >
          <KnowledgeNote label="Responsibilities">
            Pre-test research, post-test analysis, data-driven ideation,
            segment analysis. Owns the integrity of measurement and the
            interpretation of results.
          </KnowledgeNote>
          <KnowledgeNote label="When involved">
            Strategy (for ideation) → Run (for monitoring) → Analyse (for
            results).
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Lightbulb}
          title="Program Manager / Product Owner"
          subtitle="Business — owns the roadmap."
        >
          <KnowledgeNote label="Responsibilities">
            Owns the program&apos;s use cases and roadmap, executes the
            optimisation and personalisation strategy, and aligns the
            executive sponsor with the operating team.
          </KnowledgeNote>
          <KnowledgeNote label="When involved">
            All phases — they&apos;re the connective tissue.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Code}
          title="Technician / Developer / QA"
          subtitle="Technical — owns implementation and quality."
        >
          <KnowledgeNote label="Responsibilities">
            Builds activities in Adobe Target (JS/HTML/CSS), handles integrations
            with Adobe and third-party tools, and runs QA across devices,
            browsers, and audiences.
          </KnowledgeNote>
          <KnowledgeNote label="When involved">
            Design → Build → Run (for monitoring).
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Palette}
          title="Content / Designer"
          subtitle="Technical — owns the experience."
        >
          <KnowledgeNote label="Responsibilities">
            Creates the alternative designs, copy, and assets that variants
            are made of. Ensures variants meet brand guidelines and align
            with the test hypothesis.
          </KnowledgeNote>
          <KnowledgeNote label="When involved">
            Design → Build (for asset hand-off).
          </KnowledgeNote>
        </KnowledgeCard>
      </section>

      <section className="space-y-4">
        <SectionLabel icon={CalendarClock} tone="primary">
          Cadence
        </SectionLabel>

        <KnowledgeCard
          icon={CalendarDays}
          title="Weekly stakeholder sync"
          subtitle="Operating tempo for the active portfolio."
        >
          <KnowledgeNote label="Attendees">
            Strategist, Analyst, Product, UX/UI, Developers.
          </KnowledgeNote>
          <KnowledgeNote label="What's discussed">
            Updates on running activities, alignment on new initiatives, issues
            encountered, changes or iterations, cumulative learnings, open
            tasks. The default unit of work-tracking.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={CalendarRange}
          title="Monthly innovation meeting"
          subtitle="Cross-stream pattern-matching."
        >
          <KnowledgeNote label="Attendees">
            Optimisation team leaders, Analyst, Adobe Optimisation Lead.
          </KnowledgeNote>
          <KnowledgeNote label="What's discussed">
            Activity highlights across markets or business units, ROI realised
            per stream, recurring challenges, lessons that should propagate,
            focus for the next month.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={CalendarClock}
          title="Quarterly steering committee / QBR"
          subtitle="Program-level governance and direction."
        >
          <KnowledgeNote label="Attendees">
            Executive Sponsor, optimisation leaders, IT Sponsor, Adobe
            Optimisation Lead.
          </KnowledgeNote>
          <KnowledgeNote label="What's discussed">
            Program performance review, quantified ROI impact, quarterly
            achievements and challenges, and the optimisation roadmap for the
            next quarter.
          </KnowledgeNote>
        </KnowledgeCard>
      </section>

      <ExperienceLeagueLink href="https://business.adobe.com/products/target/enterprise-governance.html" />
    </div>
  );
}
