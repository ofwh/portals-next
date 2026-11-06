import type { ReactNode } from 'react';

export function PageHeader({
  titleId,
  title,
  description,
  leading,
  children,
}: {
  titleId: string;
  title: string;
  description: string;
  leading?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="min-w-0">
          <h1 id={titleId} className="text-2xl font-semibold">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
