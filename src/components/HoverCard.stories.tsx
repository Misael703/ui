import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard } from './HoverCard';
import { Avatar } from './Display2';

const meta = {
  title: 'Components/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  args: { trigger: null, children: null, openDelay: 200, closeDelay: 100 },
} satisfies Meta<typeof HoverCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ padding: 64 }}>
      <HoverCard
        {...a}
        trigger={
          <span style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>
            @gojo
          </span>
        }
      >
        <div style={{ display: 'flex', gap: 12, padding: 16, minWidth: 280 }}>
          <Avatar name="Satoru Gojo" size={48} />
          <div>
            <div style={{ fontWeight: 700 }}>Satoru Gojo</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Founder · Acme Supply Co</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>satoru@example.com</div>
          </div>
        </div>
      </HoverCard>
    </div>
  ),
};

export const WithDelay: StoryObj = {
  render: () => (
    <div style={{ padding: 48 }}>
      <HoverCard
        openDelay={500}
        closeDelay={200}
        trigger={<span style={{ borderBottom: '1px dashed', cursor: 'help' }}>Hover (delay 500ms)</span>}
      >
        <div style={{ padding: 12, fontSize: 13 }}>Apareció después de 500ms.</div>
      </HoverCard>
    </div>
  ),
};
