'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

type Options = {
  exact?: boolean;
};

//
// Query invalidation helpers (`nextjs` skill, part 2 §1).
// `invalidateKey` matches any query whose key *includes* the given segment, so
// `invalidateKey(postId)` refreshes every query keyed on that post, whatever its shape.
// `invalidateKeys` is the ordinary prefix match for a known key.
//
// Note: this predicate assumes array query keys of primitive segments. A library that keys
// queries with a single object (some SDK hooks do) will not match — invalidate those through
// whatever helper that library provides.
//
export function useQueryInvalidate() {
  const queryClient = useQueryClient();

  const invalidateKey = useCallback(
    (key: unknown) => {
      queryClient.invalidateQueries({
        predicate: query => query.queryKey.includes(key),
      });
    },
    [queryClient],
  );

  const invalidateKeys = useCallback(
    (keys: unknown[], options: Options = {}) => {
      queryClient.invalidateQueries({ queryKey: keys, ...options });
    },
    [queryClient],
  );

  return { invalidateKey, invalidateKeys };
}
