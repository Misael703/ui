import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardBody, Skeleton } from './Display';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: { width: 160, height: 16 },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="90%" />
      <Skeleton height={14} width="80%" />
      <Skeleton height={120} />
    </div>
  ),
};

/**
 * **Skeleton across the three tiers (v4.2.3).** The placeholder is
 * translucent ink relative to the host (`--skel-ink` / `--skel-ink-band`,
 * 10% and 20% of `--fg-default`), not absolute per-tier colours: it reads
 * the same on the canvas, on an `inset`, and on a card, in light and dark
 * (switch the preset and the theme in the toolbar). Before, with
 * `--bg-subtle → --bg-muted`, it was invisible on an inset and lighter than
 * the page on the canvas.
 */
export const OnThreeTiers: Story = {
  name: 'Skeleton · on the three tiers',
  render: () => {
    const lines = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={18} width="55%" />
        <Skeleton height={13} width="90%" />
        <Skeleton height={13} width="75%" />
        <Skeleton height={72} />
      </div>
    );
    const label = (t: string) => <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--fg-subtle)', marginBottom: 8 }}>{t}</div>;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, alignItems: 'start' }}>
        <div>{label('canvas')}{lines}</div>
        <Card variant="inset"><CardBody>{label('inset · --bg-subtle')}{lines}</CardBody></Card>
        <Card><CardBody>{label('surface · card')}{lines}</CardBody></Card>
      </div>
    );
  },
};
