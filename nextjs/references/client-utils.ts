'use client';

import { toast } from 'sonner';

//
// Error reporting for the mutation layer (`nextjs` skill, part 2 §6).
// Called by useActionMutation's onError — components never do this themselves.
//
// Logs enough to reproduce without a debugger: what was called, with what, and what came back.
//
// `toastId` replaces an existing toast in place instead of opening a new one. The server-action
// layer leaves it unset (it dismisses its loading toast in onSettled); a staged operation passes
// the id of its own loading toast, so one toast follows the call from sent to failed.
//
export function handleApiError(
  apiName: string,
  params: unknown,
  error: unknown,
  { toastId }: { toastId?: string } = {},
) {
  console.error('[API Error]', { apiName, params, error });

  const message = (error as { message?: string })?.message ?? 'An unexpected error occurred.';
  toast.error(message, {
    id: toastId,
    description: apiName,
    closeButton: true,
    duration: 5000,
  });
}
