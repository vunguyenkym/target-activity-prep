'use client';

import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChecklistRow } from '@/components/checklist-row';
import { ExperienceLeagueLink } from '@/components/knowledge-card';
import { saveActivity, type Activity } from '@/lib/storage';
import { QA_ITEMS, type QaItemId } from '@/lib/checklists';

type QaValues = Activity['qa'];

export function QaForm({ activity }: { activity: Activity }) {
  const form = useForm<QaValues>({ defaultValues: activity.qa });

  const persist = async () => {
    await saveActivity({ ...activity, qa: form.getValues() });
  };

  const items = form.watch('items') ?? {};
  const checkedCount = QA_ITEMS.filter((i) => items[i.id] === true).length;

  const toggleItem = (id: QaItemId, next: boolean) => {
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
          {checkedCount} / {QA_ITEMS.length}
        </span>
      </div>

      <ul className="space-y-2">
        {QA_ITEMS.map((item) => (
          <ChecklistRow
            key={item.id}
            checked={items[item.id] === true}
            onChange={(next) => toggleItem(item.id, next)}
            label={item.label}
            helper={item.helper}
          />
        ))}
      </ul>

      <div className="space-y-1.5">
        <Label htmlFor="qaNotes">QA notes</Label>
        <p className="max-w-xl text-xs text-muted-foreground">
          Anything QA-specific worth recording — known issues, environments
          tested, sign-off owner. Empty is fine if the checklist tells the
          whole story.
        </p>
        <Textarea
          id="qaNotes"
          rows={3}
          {...form.register('notes', { onBlur: persist })}
        />
      </div>

      <ExperienceLeagueLink href="https://experienceleague.adobe.com/en/docs/target/using/activities/activity-qa/activity-qa" />
    </form>
  );
}
