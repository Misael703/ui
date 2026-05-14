import type { Preview } from '@storybook/react';
// Storybook-only @font-face with paths relative to .storybook/ (the
// published `src/styles/fonts.css` uses `./fonts/` because it's authored
// for the dist/ layout where fonts/ is a sibling subdir — those paths
// would 404 if imported as-is from src/styles/ in Storybook).
import './fonts.css';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
};
export default preview;
