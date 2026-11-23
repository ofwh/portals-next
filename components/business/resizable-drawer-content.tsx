'use client';

import { useTranslations } from 'next-intl';
import { type ReactNode, useCallback, useRef, useState } from 'react';
import { DrawerContent } from '@/components/ui/drawer';

const MIN_WIDTH = 280;
const MAX_WIDTH_PERCENT = 85;
const KEYBOARD_STEP = 24;

export function ResizableDrawerContent({
  children,
  className,
  open,
}: {
  children: ReactNode;
  className?: string;
  open: boolean;
}) {
  const t = useTranslations('shared');
  const [size, setSize] = useState<{ open: boolean; width?: number }>({ open });
  const [bounds, setBounds] = useState<{ min: number; max: number; current: number; id: string }>();
  const popupRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);

  if (size.open !== open) {
    setSize({ open, width: open ? undefined : size.width });
  }

  const observePopup = useCallback((popup: HTMLDivElement | null) => {
    popupRef.current = popup;
    if (!popup) {
      return;
    }

    const viewport = popup.ownerDocument.documentElement;

    const measure = () => {
      const max = Math.floor((viewport.clientWidth * MAX_WIDTH_PERCENT) / 100);

      setBounds({ min: Math.min(MIN_WIDTH, max), max, current: Math.min(popup.offsetWidth, max), id: popup.id });
    };

    measure();
    const observer = new ResizeObserver(measure);

    observer.observe(popup);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
      popupRef.current = null;
      drag.current = null;
    };
  }, []);

  function resize(next: number) {
    const viewportWidth = popupRef.current?.ownerDocument.documentElement.clientWidth;

    if (open && viewportWidth) {
      const max = Math.floor((viewportWidth * MAX_WIDTH_PERCENT) / 100);

      setSize({ open, width: Math.min(max, Math.max(MIN_WIDTH, Math.round(next))) });
    }
  }

  return (
    <DrawerContent
      className={className}
      ref={observePopup}
      style={size.width === undefined ? undefined : { width: size.width, maxWidth: `${MAX_WIDTH_PERCENT}%` }}
    >
      {children}
      <div
        role="separator"
        aria-label={t('resizeDrawer')}
        aria-orientation="vertical"
        aria-controls={bounds?.id || undefined}
        aria-valuemin={bounds?.min}
        aria-valuemax={bounds?.max}
        aria-valuenow={bounds?.current}
        tabIndex={0}
        data-base-ui-swipe-ignore
        className="before:bg-border hover:after:bg-border focus-visible:after:bg-ring active:after:bg-ring absolute inset-y-0 left-0 z-20 w-3 cursor-col-resize touch-none outline-none group-has-[[data-code-editor-fullscreen]]/drawer-popup:hidden before:absolute before:top-1/2 before:left-1 before:h-8 before:w-0.5 before:-translate-y-1/2 before:rounded-full after:absolute after:inset-y-0 after:left-0 after:w-0.5"
        onPointerDown={(event) => {
          const popup = popupRef.current;

          if (!popup || !event.isPrimary || event.button !== 0) {
            return;
          }

          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: popup.offsetWidth };
        }}
        onPointerMove={(event) => {
          const start = drag.current;

          if (start?.pointerId === event.pointerId) {
            resize(start.startWidth + start.startX - event.clientX);
          }
        }}
        onLostPointerCapture={(event) => {
          if (drag.current?.pointerId === event.pointerId) {
            drag.current = null;
          }
        }}
        onKeyDown={(event) => {
          const current = popupRef.current?.offsetWidth;

          if (current === undefined || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
            return;
          }

          event.preventDefault();
          resize(current + (event.key === 'ArrowLeft' ? KEYBOARD_STEP : -KEYBOARD_STEP));
        }}
      />
    </DrawerContent>
  );
}
