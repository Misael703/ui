import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-interactions'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { autodocs: 'tag' },
  // `<Logo>` resolves `/assets/logos/*` (its default `logoBasePath`). Serve the
  // preset's own logo files there so there is no second copy under public/.
  staticDirs: [{ from: '../src/presets/elalba/logos', to: '/assets/logos' }],
};
export default config;
