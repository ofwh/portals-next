'use client';

import { LanguageDescription } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { Copy, Minimize, SquareDimensions } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { CODE_LANGUAGES } from '@/lib/constants/code-editor';

export function CodeEditor({
  id,
  labelId,
  descriptionId,
  value,
  onChange,
  language,
  onLanguageChange,
  languageLabel,
  disabled = false,
}: {
  id: string;
  labelId: string;
  descriptionId?: string;
  value: string;
  onChange(value: string): void;
  language: string;
  onLanguageChange(language: string): void;
  languageLabel: string;
  disabled?: boolean;
}) {
  const t = useTranslations();
  const dark = useDarkMode();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [syntax, setSyntax] = useState<{ language: string; extension: Extension }>();
  const extensions = useMemo(
    () => [
      EditorView.lineWrapping,
      EditorView.theme({ '.cm-scroller': { overflow: 'visible' } }),
      EditorView.contentAttributes.of({ id, 'aria-labelledby': labelId, 'aria-describedby': descriptionId ?? '' }),
      ...(syntax?.language === language ? [syntax.extension] : []),
    ],
    [id, labelId, descriptionId, language, syntax],
  );

  useEffect(() => {
    let active = true;
    const description = LanguageDescription.matchLanguageName(languages, language === 'shell' ? 'sh' : language);

    if (language !== 'plaintext' && description) {
      description.load().then(
        (extension) => {
          if (active) {
            setSyntax({ language, extension });
          }
        },
        () => {
          if (active) {
            toast.error(t('shared.loadErrorDescription'));
          }
        },
      );
    }

    return () => {
      active = false;
    };
  }, [language, t]);

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t('shared.copySuccess'));
    } catch {
      toast.error(t('shared.copyError'));
    }
  }

  return (
    <div
      data-code-editor-fullscreen={fullscreen ? '' : undefined}
      className={`group/code-editor bg-background min-w-0 overflow-hidden ${fullscreen ? 'fixed inset-0 z-50' : 'relative w-full rounded-md border'}`}
    >
      <ScrollArea className={`min-w-0 ${fullscreen ? 'h-full' : 'h-100'}`}>
        <CodeMirror
          value={value}
          onChange={onChange}
          minHeight="400px"
          theme={dark ? 'dark' : 'light'}
          extensions={extensions}
          editable={!disabled}
          readOnly={disabled}
          indentWithTab={false}
          className="text-sm [&_.cm-scroller]:font-mono"
        />
      </ScrollArea>
      <div
        className={`pointer-events-none absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-focus-within/code-editor:pointer-events-auto group-focus-within/code-editor:opacity-100 group-hover/code-editor:pointer-events-auto group-hover/code-editor:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100 ${languageOpen ? 'pointer-events-auto opacity-100' : ''}`}
      >
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          className="bg-popover"
          aria-label={t(fullscreen ? 'shared.exitFullscreen' : 'shared.enterFullscreen')}
          aria-pressed={fullscreen}
          onClick={() => setFullscreen((value) => !value)}
        >
          {fullscreen ? <Minimize /> : <SquareDimensions />}
        </Button>
        <Select
          value={language}
          items={CODE_LANGUAGES}
          onValueChange={(next) => {
            if (next) {
              onLanguageChange(next);
            }
          }}
          open={languageOpen}
          onOpenChange={setLanguageOpen}
          disabled={disabled}
        >
          <SelectTrigger
            size="sm"
            className="bg-popover max-w-40 gap-1 px-2 py-1 text-xs data-[size=sm]:h-6 [&_svg]:size-3"
            aria-label={languageLabel}
          >
            <SelectValue>{CODE_LANGUAGES.find((item) => item.value === language)?.label ?? language}</SelectValue>
          </SelectTrigger>
          <SelectContent side="bottom" alignItemWithTrigger={false}>
            {CODE_LANGUAGES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          className="bg-popover"
          aria-label={t('shared.copy')}
          onClick={copyContent}
          disabled={disabled}
        >
          <Copy />
        </Button>
      </div>
    </div>
  );
}
