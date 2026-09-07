'use client';
import * as React from 'react';

/**
 * Reactive `matchMedia` (internal, v3.7.0). SSR-safe: the first render returns
 * `false` (the wide branch), then subscribes; a consumer that renders a
 * narrow-only layout on the server would otherwise hydrate against a different
 * tree. Same pattern AppShell uses inline for its mobile drawer.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, [query]);
  return matches;
}
