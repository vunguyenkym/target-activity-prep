'use client';

import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChecklistRow } from '@/components/checklist-row';
import { ExperienceLeagueLink } from '@/components/knowledge-card';
import { saveActivity, type Activity } from '@/lib/storage';
import { LAUNCH_ITEMS, type LaunchItemId } from '@/lib/checklists';

type LaunchValues = Activity['launch'];

export function LaunchForm({ activity }: { activity: Activity }) {
  const form = useForm<LaunchValues>({ defaultValues: activity.launch });

  const persist = async () => {
    await saveActivity({ ...activity, launch: form.getValues() });
  };

  const items = form.watch('items') ?? {};
  const checkedCount = LAUNCH_ITEMS.filter((i) => items[i.id] === true).length;

  const toggleItem = (id: LaunchItemId, next: boolean) => {
    form.setValue(`items.${id}`, next, { shouldDirty: true });
    void persist();
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Checklist progress
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {checkedCount} / {LAUNCH_ITEMS.length}
        </span>
      </div>

      <ul className="space-y-2">
        {LAUNCH_ITEMS.map((item) => (
          <ChecklistRow
            key={item.id}
            checked={items[item.id] === true}
            onChange={(next) => toggleItem(item.id, next)}
            label={item.label}
            helper={item.helper}
          />
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="launchDate">Launch date</Label>
          <Input
            id="launchDate"
            type="date"
            {...form.register('launchDate', { onBlur: persist })}
          />
          <p className="text-xs text-muted-foreground">
            When the activity went, or will go, live.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="firstReviewDate">First weekly review</Label>
          <Input
            id="firstReviewDate"
            type="date"
            {...form.register('firstReviewDate', { onBlur: persist })}
          />
          <p className="text-xs text-muted-foreground">
            Set the first stakeholder check-in on the activity post-launch.
          </p>
        </div>
      </div>

      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/reports/reports" />
    </form>
  );
}
