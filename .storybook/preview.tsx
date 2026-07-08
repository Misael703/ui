import * as React from 'react';
import type { Preview } from '@storybook/react';
// Storybook-only @font-face with paths relative to .storybook/ (the
// published `src/styles/fonts.css` uses `./fonts/` because it's authored
// for the dist/ layout where fonts/ is a sibling subdir — those paths
// would 404 if imported as-is from src/styles/ in Storybook).
import './fonts.css';
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
