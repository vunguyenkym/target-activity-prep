import {
  Boxes,
  Layers,
  Shuffle,
  Sparkles,
  Target as TargetIcon,
  TrendingUp,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import {
  ExperienceLeagueLink,
  KnowledgeCard,
  KnowledgeNote,
} from '@/components/knowledge-card';

export default function ActivityTypesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Knowledge · Reference"
        title="Adobe Target Activity Types"
        description="The seven activity types Adobe Target ships with — what they actually do, when each is the right pick, and what they cost you in traffic or setup."
      />

      <div className="space-y-4">
        <KnowledgeCard
          icon={TargetIcon}
          title="A/B Test"
          subtitle="Winner-declaring test of two or more variants on the same page or flow."
        >
          <KnowledgeNote label="When to reach for it">
            You have a clear hypothesis and want a single causal answer — does
            the change move the metric, yes or no.
          </KnowledgeNote>
          <KnowledgeNote label="What it costs">
            Standard two-proportion sample-size math; works on most traffic.
            The default starting point for any optimization program.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Shuffle}
          title="Auto-Allocate"
          subtitle="An A/B test where Adobe Sensei shifts traffic toward leaders during the run."
        >
          <KnowledgeNote label="When to reach for it">
            Same setup as an A/B test, but you&apos;d rather pay forward to a
            leader than hold a strict 50/50 split — useful when you have
            confidence in the candidates and want compounding lift while the
            test is live.
          </KnowledgeNote>
          <KnowledgeNote label="What it costs">
            Significance interpretation gets less clean because traffic is
            unequal by design. Be explicit with stakeholders about how to read
            the result before you start.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Boxes}
          title="Multivariate Test (MVT)"
          subtitle="Tests every combination of multiple element changes at once."
        >
          <KnowledgeNote label="When to reach for it">
            You suspect specific elements interact — a CTA copy change might
            only work with the new hero image — and you want to find the best
            combination rather than test each change in isolation.
          </KnowledgeNote>
          <KnowledgeNote label="What it costs">
            Sample size scales with the number of combinations. Two elements
            with three variants each means nine cells, so traffic requirements
            multiply quickly. Only worth it on high-volume pages.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Users}
          title="Experience Targeting (XT)"
          subtitle="Delivers different content to different audiences without a statistical test."
        >
          <KnowledgeNote label="When to reach for it">
            Your goal is personalisation, not picking a winner — e.g.,
            logged-in vs anonymous, returning vs new, geo-specific promos.
          </KnowledgeNote>
          <KnowledgeNote label="What it costs">
            Minimal. No significance math, no winner declared. Trade-off: you
            never learn whether the targeted variant actually outperformed the
            default for that audience.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={TrendingUp}
          title="Auto-Target"
          subtitle="Sensei picks the best variant per visitor based on profile and contextual signals."
        >
          <KnowledgeNote label="When to reach for it">
            You have pre-built variants and want the platform to serve each
            visitor whichever one is best for them, rather than treating
            everyone the same.
          </KnowledgeNote>
          <KnowledgeNote label="What it costs">
            Training period before the model is reliable; harder to explain
            post-hoc since there&apos;s no single winning variant. You learn
            &quot;personalised lift,&quot; not &quot;the new hero beat the old
            one.&quot;
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Sparkles}
          title="Auto-Personalization (AP)"
          subtitle="Always-on ML that matches offer variations to each visitor at scale."
        >
          <KnowledgeNote label="When to reach for it">
            You have at least 3 viable variants, your audience is heterogeneous
            enough that no single experience will win for everyone, and you
            have rich profile data to feed the model.
          </KnowledgeNote>
          <KnowledgeNote label="What it costs">
            Same as Auto-Target with more emphasis on always-on,
            cross-activity scale. Needs enough traffic per profile slice for
            the model to stabilise.
          </KnowledgeNote>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Layers}
          title="Recommendations"
          subtitle="Surfaces products or content via collaborative-filtering or content-based algorithms."
        >
          <KnowledgeNote label="When to reach for it">
            Catalog-driven sites where the right item to surface varies by
            visitor and context — retail PDPs, content discovery, related
            articles.
          </KnowledgeNote>
          <KnowledgeNote label="What it costs">
            Needs a product catalog feed plus behavioural data to train the
            recommendation model. Different evaluation model than A/B —
            you&apos;re comparing recommendation strategies, not single
            variants.
          </KnowledgeNote>
        </KnowledgeCard>
      </div>

      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/activities/target-activities-guide" />
    </div>
  );
}
