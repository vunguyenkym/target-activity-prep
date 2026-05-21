import {
  Eye,
  Gauge,
  Lightbulb,
  ListChecks,
  Map,
  Trophy,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import {
  ExperienceLeagueLink,
  KnowledgeCard,
} from '@/components/knowledge-card';

export default function MethodologyPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Knowledge · Reference"
        title="Testing Methodology"
        description="Six principles that separate testing programs that compound into product knowledge from ones that produce ambiguous noise."
      />

      <div className="space-y-4">
        <KnowledgeCard
          icon={Map}
          title="Strategy before tactics"
          subtitle="Connect activities to business objectives before you pick what to change."
        >
          <p>
            It&apos;s tempting to start with &quot;what content should we
            optimise?&quot; — but that rarely compounds. Anchor first to a
            business objective (KBO), then identify where in the journey
            you&apos;d move it, then design the test.
          </p>
          <p className="text-muted-foreground">
            A program without strategy produces a list of activities. A program
            with strategy produces a steady drumbeat of business outcomes.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Lightbulb}
          title="Hypothesis before variant"
          subtitle="If you can't write the statement, you don't have a test — you have a guess."
        >
          <p>
            Skipping the hypothesis is the most common reason post-test debriefs
            go in circles. The discipline of writing &quot;For [audience], we
            believe that [change] will result in [outcome] because
            [reasoning]&quot; forces you to name the mechanism you&apos;re
            actually testing.
          </p>
          <p className="text-muted-foreground">
            Without it, any result is interpretable as a win.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={ListChecks}
          title="Pick metrics before launch"
          subtitle="Primary, secondary, guardrails — all committed before traffic flows."
        >
          <p>
            Picking the metric after seeing the data is how teams accidentally
            lie to themselves. The right discipline: write down your primary
            metric, 1–3 secondaries, and the guardrails that would block
            roll-out even if you win on primary.
          </p>
          <p className="text-muted-foreground">
            If you can&apos;t commit to a primary metric ahead of time, the
            hypothesis isn&apos;t sharp enough yet.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Gauge}
          title="Power your test"
          subtitle="Agree on baseline, MDE, and run length up front — and respect the math."
        >
          <p>
            An underpowered test that comes back flat doesn&apos;t tell you the
            change had no effect. It tells you nothing: the sample wasn&apos;t
            big enough to detect a real difference of the size you cared about.
          </p>
          <p className="text-muted-foreground">
            Set MDE based on what change is worth acting on, not what change
            you secretly hope for.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Eye}
          title="Don't peek"
          subtitle="The sample-size calc assumes a single read at the end of the run."
        >
          <p>
            Checking every day and calling a test early when something looks
            significant is the single fastest way to ship a placebo.
            Sequential checks inflate the false-positive rate well above the
            confidence level you&apos;d expect.
          </p>
          <p className="text-muted-foreground">
            If you genuinely need interim checks, use a sequential testing
            method that accounts for them; otherwise wait for the calculated
            duration.
          </p>
        </KnowledgeCard>

        <KnowledgeCard
          icon={Trophy}
          title="Define winning up front"
          subtitle="What lift, on which metric, sustained how long, justifies roll-out?"
        >
          <p>
            &quot;Statistically significant&quot; is not the same as &quot;worth
            the engineering cost.&quot; A 0.3% lift on a low-cost change may
            ship; the same lift on something that adds latency or maintenance
            burden may not. Decide ahead of time so the result reads itself.
          </p>
        </KnowledgeCard>
      </div>

      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/activities/abtest/sample-size-determination" />
    </div>
  );
}
