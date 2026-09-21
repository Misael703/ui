import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Layout';

const meta = {
  title: 'Components/Grid',
  component: Grid,
  tags: ['autodocs'],
  args: { minColWidth: 180, gap: 4 },
} satisfies Meta<typeof Grid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <Grid {...a}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} style={{ padding: 16, background: 'var(--bg-subtle)', borderRadius: 8, textAlign: 'center' }}>
          Item {n}
        </div>
      ))}
    </Grid>
  ),
};

const Box = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 16, background: 'var(--bg-subtle)', borderRadius: 8, textAlign: 'center' }}>{children}</div>
);

/**
 * **Responsive grid** — `columns={{ base: 1, sm: 2, lg: 4 }}`. Shrink the
 * viewport (or the Storybook panel) to see the reflow: 1 column on mobile, 2
 * from 480px, 4 from 1024px. Each breakpoint inherits from the previous one
 * when omitted.
 */
export const Responsive: Story = {
  render: () => (
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <Box key={n}>Item {n}</Box>)}
    </Grid>
  ),
};
