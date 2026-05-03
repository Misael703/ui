import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { autodocs: 'tag' },
  // Serve `public/` as static root so components that reference absolute paths
  // (e.g. `<Logo>` looking for `/assets/logos/...`) resolve correctly inside
  // the Storybook iframe.
  staticDirs: ['../public'],
};
export default config;
