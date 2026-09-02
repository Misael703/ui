import * as React from 'react';
import type { Preview } from '@storybook/react';
import { addons } from '@storybook/preview-api';
import { GLOBALS_UPDATED, SET_GLOBALS, STORY_ARGS_UPDATED } from '@storybook/core-events';
// Storybook-only @font-face with paths relative to .storybook/ (the
// published `src/styles/fonts.css` uses `./fonts/` because it's authored
// for the dist/ layout where fonts/ is a sibling subdir — those paths
// would 404 if imported as-is from src/styles/ in Storybook).
import './fonts.css';
import './reset.css';
import '../src/styles/index.css';
// Vite `?inline` returns the CSS file's content as a string instead of
// injecting it. We toggle it in/out via the decorator below, so Storybook
// uses the EXACT same preset file consumers import — no parallel copy that
// could drift from src/presets/elalba/styles.css.
// @ts-expect-error — `?inline` is a Vite query, no ambient type
import elalbaPresetCss from '../src/presets/elalba/styles.css?inline';

const PRESET_STYLE_ID = 'sb-preset-elalba';

// Dark theme is opt-in via `data-theme="dark"` on a root ancestor — stamp it on
// the iframe's <html> so the story sees the exact cascade a consumer gets, and
// tint the canvas so the surface tiers are visible.
const withTheme = (
  Story: React.FC,
  context: { globals: { theme?: string } },
) => {
  const theme = context.globals.theme ?? 'light';
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    document.body.style.background = 'var(--bg-canvas)';
    document.body.style.color = 'var(--fg-default)';
  }, [theme]);
  return <Story />;
};

const withPreset = (
  Story: React.FC,
  context: { globals: { preset?: string } },
) => {
  const preset = context.globals.preset ?? 'generic';
  React.useEffect(() => {
    let el = document.getElementById(
      PRESET_STYLE_ID,
    ) as HTMLStyleElement | null;
    if (preset === 'elalba') {
      if (!el) {
        el = document.createElement('style');
        el.id = PRESET_STYLE_ID;
        document.head.appendChild(el);
      }
      el.textContent = elalbaPresetCss as string;
    } else if (el) {
      el.remove();
    }
  }, [preset]);
  return <Story />;
};

// --- Globals + args bridge for `inline: false` docs canvases ----------------
// Stories rendered with `docs: { story: { inline: false } }` (AppShell — the
// 100vh shell can't render inline in the docs column) live in NESTED
// iframe.html instances. Each nested iframe is an independent preview that
// boots with default globals/args and is not on the manager's channel — so
// neither the preset/theme toolbar NOR the docs controls table ever reach
// it: docs always showed the generic palette and dead controls. Storybook
// natively reads `iframe.html?globals=...&args=...`, so this preview (the
// docs page) mirrors its CURRENT globals and per-story args into each nested
// story iframe's src; the child re-boots with the right state and the
// decorators/argTypes apply exactly as in a top-level story.
if (typeof window !== 'undefined') {
  let currentGlobals: Record<string, unknown> = {};
  const storyArgs = new Map<string, Record<string, unknown>>();
  // Only OUR scalar globals: addon globals (a11y, viewport…) are objects that
  // serialize as "[object Object]" and would corrupt the child's state.
  const SYNCED_GLOBALS = ['preset', 'theme'];
  // SB URL grammar: booleans are `!true` / `!false`; strings go verbatim.
  const serializeArg = (v: unknown) => (typeof v === 'boolean' ? `!${v}` : String(v));
  const isScalar = (v: unknown) =>
    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
  const syncNestedIframes = () => {
    const globalsQs = SYNCED_GLOBALS
      .filter((k) => currentGlobals[k] != null)
      .map((k) => `${k}:${String(currentGlobals[k])}`)
      .join(';');
    document
      .querySelectorAll<HTMLIFrameElement>('iframe[src*="iframe.html"]')
      .forEach((frame) => {
        const url = new URL(frame.getAttribute('src') ?? '', window.location.href);
        const args = storyArgs.get(url.searchParams.get('id') ?? '');
        const argsQs = args
          ? Object.entries(args)
              .filter(([, v]) => isScalar(v))
              .map(([k, v]) => `${k}:${serializeArg(v)}`)
              .join(';')
          : '';
        let dirty = false;
        for (const [key, next] of [['globals', globalsQs], ['args', argsQs]] as const) {
          if ((url.searchParams.get(key) ?? '') === next) continue;
          if (next) url.searchParams.set(key, next);
          else url.searchParams.delete(key);
          dirty = true;
        }
        if (dirty) frame.setAttribute('src', `${url.pathname}?${url.searchParams.toString()}`);
      });
  };
  const channel = addons.getChannel();
  const onGlobals = ({ globals }: { globals: Record<string, unknown> }) => {
    currentGlobals = globals;
    syncNestedIframes();
  };
  channel.on(SET_GLOBALS, onGlobals);      // boot (incl. URL-persisted globals)
  channel.on(GLOBALS_UPDATED, onGlobals);  // toolbar changes
  // Docs controls table → the docs preview's args store → mirror to the iframe.
  channel.on(STORY_ARGS_UPDATED, ({ storyId, args }: { storyId: string; args: Record<string, unknown> }) => {
    storyArgs.set(storyId, args);
    syncNestedIframes();
  });
  // Docs re-renders recreate iframes with the original src — re-stamp them.
  new MutationObserver(syncNestedIframes).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

const preview: Preview = {
  globalTypes: {
    preset: {
      description: 'Brand preset overlay (injects the real El Alba preset CSS)',
      defaultValue: 'generic',
      toolbar: {
        title: 'Preset',
        icon: 'paintbrush',
        items: [
          { value: 'generic', title: 'Genérico (espresso)' },
          { value: 'elalba', title: 'El Alba (preset)' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Color theme (data-theme on the root)',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Claro' },
          { value: 'dark', title: 'Oscuro' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withPreset, withTheme],
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
};
export default preview;
