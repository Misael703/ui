import * as React from 'react';
import type { Preview } from '@storybook/react';
// Storybook-only @font-face with paths relative to .storybook/ (the
// published `src/styles/fonts.css` uses `./fonts/` because it's authored
// for the dist/ layout where fonts/ is a sibling subdir — those paths
// would 404 if imported as-is from src/styles/ in Storybook).
import './fonts.css';
import './reset.css';
import '../src/styles/index.css';
// Vite `?inline` returns the file content as a string; the decorator toggles it
// so Storybook uses the exact preset file consumers import.
// @ts-expect-error — `?inline` is a Vite query, no ambient type
import presetCss from '../src/presets/elalba/styles.css?inline';

const PRESET_STYLE_ID = 'sb-preset';

// Dark theme is opt-in via `data-theme="dark"` on a root ancestor.
const withTheme = (Story: React.FC, context: { globals: { theme?: string } }) => {
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

const withPreset = (Story: React.FC, context: { globals: { preset?: string } }) => {
  const preset = context.globals.preset ?? 'generic';
  React.useEffect(() => {
    let el = document.getElementById(PRESET_STYLE_ID) as HTMLStyleElement | null;
    if (preset === 'elalba') {
      if (!el) { el = document.createElement('style'); el.id = PRESET_STYLE_ID; document.head.appendChild(el); }
      el.textContent = presetCss as string;
    } else if (el) {
      el.remove();
    }
  }, [preset]);
  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    preset: {
      description: 'Brand preset overlay (injects the example preset CSS)',
      defaultValue: 'generic',
      toolbar: {
        title: 'Preset',
        icon: 'paintbrush',
        items: [
          { value: 'generic', title: 'Generic (espresso)' },
          { value: 'elalba', title: 'Example preset (El Alba)' },
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
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
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
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] }, options: { runOnly: ['wcag2a', 'wcag2aa'] } },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile (400)', styles: { width: '400px', height: '800px' } },
        tablet: { name: 'Tablet (768)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (1280)', styles: { width: '1280px', height: '800px' } },
      },
    },
    options: {
      storySort: {
        order: ['Docs', ['Introduction', 'Getting started', 'Theming', 'Accessibility', 'Hooks'], 'Foundations', 'Components', 'Patterns', 'Blocks', 'Internal'],
      },
    },
  },
};
export default preview;
