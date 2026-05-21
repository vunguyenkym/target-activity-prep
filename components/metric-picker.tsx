'use client';

import { Info, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  METRIC_INFO,
  METRIC_LABELS,
  METRIC_TYPES,
  metricFromType,
} from '@/lib/metrics';
import type { Metric, MetricType } from '@/lib/storage';

export function MetricPicker({
  value,
  onChange,
  onPersist,
  onRemove,
}: {
  value: Metric | null;
  onChange: (next: Metric) => void;
  onPersist: () => void;
  onRemove?: () => void;
}) {
  const handleTypeChange = (type: MetricType) => {
    const previousName = value?.type === 'custom' ? value.name : undefined;
    onChange(metricFromType(type, previousName));
    onPersist();
  };

  const handleNameInput = (name: string) => {
    if (!value) return;
    onChange({ ...value, name });
  };

  const handleRemove = () => {
    if (!onRemove) return;
    onRemove();
    onPersist();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={value?.type ?? ''}
        onValueChange={(v) => {
          if (typeof v !== 'string' || v === '') return;
          handleTypeChange(v as MetricType);
        }}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Pick a metric type">
            {(v: unknown) =>
              typeof v === 'string' && v in METRIC_LABELS
                ? METRIC_LABELS[v as MetricType]
                : null
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {METRIC_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {METRIC_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value && (
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                aria-label="About this metric"
                className="text-muted-foreground hover:text-foreground"
              >
                <Info className="size-4" />
              </button>
            }
          />
          <PopoverContent side="top" className="max-w-xs text-sm">
            {METRIC_INFO[value.type]}
          </PopoverContent>
        </Popover>
      )}

      {value?.type === 'custom' && (
        <Input
          value={value.name}
          placeholder="Metric name"
          className="w-56"
          onChange={(e) => handleNameInput(e.target.value)}
          onBlur={onPersist}
        />
      )}

      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          aria-label="Remove metric"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
