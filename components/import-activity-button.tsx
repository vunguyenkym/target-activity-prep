// Small "Import JSON" control that sits next to Load example / Clear
// data on the Overview screen. Reads a .json file, replaces the single
// local activity, and reloads so every useLiveQuery re-reads the new
// current activity.

'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { importActivityFromJson } from '@/lib/import-activity';

export function ImportActivityButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    // Single-activity model: importing replaces what's in this browser.
    if (
      !window.confirm(
        'Importing replaces the current activity in this browser. Continue?',
      )
    ) {
      return;
    }

    setBusy(true);
    setError('');
    try {
      const text = await file.text();
      const result = await importActivityFromJson(text);
      if (result.ok) {
        window.location.reload();
      } else {
        setError(result.error);
      }
    } catch {
      setError('Could not read that file.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-3.5" />
        {busy ? 'Importing…' : 'Import JSON'}
      </Button>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
