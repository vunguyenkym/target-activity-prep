import { PageHeader } from '@/components/page-header';
import { SetupWalkthrough } from '@/components/setup-walkthrough';
import { ExperienceLeagueLink } from '@/components/knowledge-card';

export default function SetupWalkthroughPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Knowledge · Setup Walk-through"
        title="Set up a Target activity, A to Z"
        description="Six steps mirroring Adobe's documented activity-creation flow. Works for A/B, Auto-Target, and Experience Targeting — switch type above to see where the flow diverges."
      />
      <SetupWalkthrough />
      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/activities/activities" />
    </div>
  );
}
