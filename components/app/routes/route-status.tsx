import { CircleCheck, CircleSlash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function RouteStatus({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span role="img" aria-label={label} className="inline-flex align-middle" />}>
        {enabled ? (
          <CircleCheck aria-hidden="true" className="size-5 text-green-500 dark:text-green-400" />
        ) : (
          <CircleSlash aria-hidden="true" className="text-muted-foreground size-5" />
        )}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
