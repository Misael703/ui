'use client';
import * as React from 'react';
import type { UiKitMessages } from './messages';
import { esMessages } from './es';

const LocaleContext = React.createContext<UiKitMessages | null>(null);

export interface LocaleProviderProps {
  /**
   * Partial dict of overrides. Missing keys fall back to `esMessages`,
   * so consumers can translate just a few strings without re-declaring all.
   */
  messages?: Partial<UiKitMessages>;
  children: React.ReactNode;
}

export function LocaleProvider({ messages, children }: LocaleProviderProps) {
  const merged = React.useMemo<UiKitMessages>(
    () => (messages ? { ...esMessages, ...messages } : esMessages),
    [messages]
  );
  return <LocaleContext.Provider value={merged}>{children}</LocaleContext.Provider>;
}

/**
 * Returns the active messages dict. Falls back to `esMessages` when no
 * `<LocaleProvider>` is present in the tree, so components remain usable
 * standalone.
 */
export function useLocale(): UiKitMessages {
  return React.useContext(LocaleContext) ?? esMessages;
}
