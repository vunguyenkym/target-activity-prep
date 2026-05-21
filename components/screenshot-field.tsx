'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { fileToCompressedDataUrl } from '@/lib/image';

export function ScreenshotField({
  label,
  value,
  alt,
  onChange,
}: {
  label: string;
  value: string;
  alt: string;
  onChange: (next: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError('Could not process that image. Try a JPEG or PNG under 10 MB.');
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {value ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={alt}
            className="w-full max-w-md rounded-md border border-border object-contain"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="size-4" /> Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
            >
              <Trash2 className="size-4" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full max-w-md flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
        >
          <ImagePlus className="size-5" />
          <span>Upload screenshot or mock-up</span>
          <span className="text-xs text-muted-foreground">
            JPEG or PNG · resized to 1200×800 max
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
