'use client';

import { useTranslations } from 'next-intl';
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFields,
  ColorPickerPanel,
  ColorPickerSlider,
  ColorPickerSwatches,
  ColorPickerTrigger,
} from '@/components/reui/color-picker';
import { useTagColor } from '@/hooks/use-tag';

export function RecentColorPicker({
  id,
  label,
  value,
  disabled = false,
  swatches,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  swatches?: readonly string[];
  onChange: (value: string) => void;
}) {
  const t = useTranslations('admin.settings.system.tags.shared.colorPicker');
  const { colors, addRecent } = useTagColor(swatches);

  return (
    <ColorPicker
      id={id}
      value={value}
      format="hex"
      disabled={disabled}
      aria-label={label}
      onValueChange={(next) => {
        if (next) {
          onChange(next);
        }
      }}
      onValueCommit={addRecent}
      i18n={{
        labels: {
          placeholder: t('placeholder'),
          panelLabel: t('panel'),
          openPicker: t('open'),
          area: t('area'),
          hue: t('hue'),
          saturation: t('saturation'),
          brightness: t('brightness'),
          lightness: t('lightness'),
          chroma: t('chroma'),
          red: t('red'),
          green: t('green'),
          blue: t('blue'),
          alpha: t('alpha'),
          hex: 'HEX',
          format: t('format'),
          eyeDropper: t('eyeDropper'),
          copy: t('copy'),
          copied: t('copied'),
          clear: t('clear'),
          swatches: t('swatches'),
        },
      }}
    >
      <ColorPickerTrigger className="w-auto min-w-36" />
      <ColorPickerContent side="top" align="center">
        <ColorPickerPanel>
          <ColorPickerArea />
          <div className="flex items-center gap-3">
            <ColorPickerEyeDropper />
            <ColorPickerSlider channel="hue" />
          </div>
          <ColorPickerFields />
          <ColorPickerSwatches className="grid-cols-9" colors={colors} />
        </ColorPickerPanel>
      </ColorPickerContent>
    </ColorPicker>
  );
}
