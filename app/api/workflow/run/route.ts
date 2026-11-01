import { handleResponse } from '@/lib/api/server';
import { eventStream } from '@/lib/api/sse';
import service from '@/lib/services/workflow';
import type { RunEvent } from '@/lib/workflow/model';

export async function POST(request: Request) {
  return handleResponse(request, (params, { locale }) =>
    eventStream<RunEvent>(request.signal, (context) => {
      const run = service.run(params, { ...context, locale });

      return { ...run, headers: { 'X-Workflow-Token': run.token } };
    }),
  );
}
