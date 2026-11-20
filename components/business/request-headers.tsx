'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';

interface HeaderRow {
  id: string;
  name: string;
  value: string;
}
interface RequestHeadersProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  rows: HeaderRow[];
  onChange: (rows: HeaderRow[]) => void;
  labels: { add: string; remove: string; name: string; value: string };
}

const headerNames = [
  'User-Agent',
  'Authorization',
  'Accept',
  'Accept-Language',
  'Content-Type',
  'Origin',
  'Referer',
  'Cookie',
  'X-Request-ID',
  'X-Forwarded-For',
  'X-Real-IP',
];

export function RequestHeaders({ rows, onChange, labels, className, ...props }: RequestHeadersProps) {
  function updateRow(id: string, changes: Partial<Pick<HeaderRow, 'name' | 'value'>>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }

  return (
    <div className={`flex w-full min-w-0 flex-col gap-3 ${className ?? ''}`} role="group" {...props}>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={labels.add}
          onClick={() => onChange([...rows, { id: crypto.randomUUID(), name: '', value: '' }])}
        >
          <Plus />
        </Button>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] gap-2">
            <Combobox
              items={headerNames}
              value={row.name}
              inputValue={row.name}
              openOnInputClick
              onInputValueChange={(name, details) => {
                if (details.reason === 'input-change' || details.reason === 'input-clear') {
                  updateRow(row.id, { name });
                }
              }}
              onValueChange={(name) => {
                if (name !== null) {
                  updateRow(row.id, { name, value: `\${${name}}` });
                }
              }}
            >
              <ComboboxInput
                className="w-full min-w-0"
                showTrigger={false}
                placeholder={labels.name}
                aria-label={labels.name}
              />
              <ComboboxContent side="bottom">
                <ComboboxList>
                  {(name: string) => (
                    <ComboboxItem key={name} value={name}>
                      {name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Input
              value={row.value}
              onChange={(event) => updateRow(row.id, { value: event.target.value })}
              placeholder={labels.value}
              aria-label={labels.value}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              aria-label={labels.remove}
              onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
