'use client';

import { Controller, useForm } from 'react-hook-form';
import { Clock, Eraser, History, Sparkles } from 'lucide-react';
import {
  clearCurrentActivity,
  makeBlankActivity,
  makeDefaultActivity,
  saveActivity,
  type Activity,
  type ActivityType,
} from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ACTIVITY_TYPES: ActivityType[] = [
  'A/B',
  'MVT',
  'XT',
  'AP',
  'Recommendations',
];

type OverviewValues = Activity['overview'];

export function OverviewForm({ activity }: { activity: Activity }) {
  const form = useForm<OverviewValues>({ defaultValues: activity.overview });

  const persist = async () => {
    const values = form.getValues();
    await saveActivity({ ...activity, overview: values });
  };

  const context = form.watch('context') ?? '';

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
          <Clock className="size-3" strokeWidth={2} aria-hidden />
          Created {formatDate(activity.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-1 text-accent-foreground">
          <History className="size-3" strokeWidth={2} aria-hidden />
          Updated {formatDate(activity.updatedAt)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={async () => {
              const proceed = window.confirm(
                'Clear all activity data? This wipes every section back to blank. Can be undone with Load example.',
              );
              if (!proceed) return;
              const blank = makeBlankActivity();
              // Reset the Overview form first so the visible fields
              // clear immediately; other section forms remount on
              // navigation and pick up the cleared activity from IDB.
              form.reset(blank.overview);
              await clearCurrentActivity(activity);
            }}
          >
            <Eraser className="size-3.5" />
            Clear data
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              const proceed = window.confirm(
                'Load a randomised example activity? This will overwrite the current activity.',
              );
              if (!proceed) return;
              const example = await makeDefaultActivity();
              form.reset(example.overview);
              await saveActivity({
                ...example,
                id: activity.id,
                createdAt: activity.createdAt,
              });
            }}
          >
            <Sparkles className="size-3.5" />
            Load example
          </Button>
        </div>
      </div>

      <Field id="name" label="Activity name" required>
        <Input
          id="name"
          autoComplete="off"
          {...form.register('name', { onBlur: persist })}
        />
      </Field>

      <Field
        id="kbo"
        label="Business objective (KBO)"
        helper="The business outcome this activity serves — e.g., increase new-member sign-ups, reduce CPL, lift conversion on the upgrade flow. Plain English, one line."
      >
        <Input
          id="kbo"
          autoComplete="off"
          placeholder="Increase new-member sign-ups from organic homepage traffic"
          {...form.register('kbo', { onBlur: persist })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field id="owner" label="Owner">
          <Input
            id="owner"
            autoComplete="off"
            placeholder="Strategist / Program Owner"
            {...form.register('owner', { onBlur: persist })}
          />
        </Field>
        <Field
          id="approver"
          label="Approver"
          helper="Who signs off before launch — typically the program lead or executive sponsor."
        >
          <Input
            id="approver"
            autoComplete="off"
            {...form.register('approver', { onBlur: persist })}
          />
        </Field>
      </div>

      <Field id="siteUrl" label="Site URL">
        <Input
          id="siteUrl"
          type="url"
          placeholder="https://example.com"
          autoComplete="off"
          {...form.register('siteUrl', { onBlur: persist })}
        />
      </Field>

      <Field
        id="testLocationUrl"
        label="Test location URL"
        helper="The specific page or flow where this activity will run — not the brand homepage if the test is on a deeper page."
      >
        <Input
          id="testLocationUrl"
          type="url"
          placeholder="https://example.com/products/promo"
          autoComplete="off"
          {...form.register('testLocationUrl', { onBlur: persist })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field id="activityType" label="Activity type">
          <Controller
            control={form.control}
            name="activityType"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  if (typeof value !== 'string') return;
                  field.onChange(value as ActivityType);
                  void persist();
                }}
              >
                <SelectTrigger id="activityType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          id="workspace"
          label="Adobe Target workspace"
          helper="The Adobe Target workspace (product profile) this activity lives in — e.g., Default Workspace, APAC web."
        >
          <Input
            id="workspace"
            autoComplete="off"
            placeholder="Default Workspace"
            {...form.register('workspace', { onBlur: persist })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field id="startDate" label="Start date">
          <Input
            id="startDate"
            type="date"
            {...form.register('startDate', { onBlur: persist })}
          />
        </Field>
        <Field id="endDate" label="End date">
          <Input
            id="endDate"
            type="date"
            {...form.register('endDate', { onBlur: persist })}
          />
        </Field>
      </div>

      <Field id="context" label="Context">
        <Textarea
          id="context"
          rows={4}
          maxLength={500}
          placeholder="Why are we running this? Anything a teammate would need to understand the activity."
          {...form.register('context', { onBlur: persist })}
        />
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {context.length} / 500
        </div>
      </Field>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  helper,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {helper && (
        <p className="max-w-xl text-xs text-muted-foreground">{helper}</p>
      )}
      {children}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}
