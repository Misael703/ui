import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard } from './HoverCard';
import { Avatar } from './Display2';

export default { title: 'Overlay/HoverCard', tags: ['autodocs'] } as Meta;

export const Basico: StoryObj = {
  render: () => (
    <div style={{ padding: 64 }}>
      <HoverCard
        trigger={
          <span style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>
            @misael703
          </span>
        }
      >
        <div style={{ display: 'flex', gap: 12, padding: 16, minWidth: 280 }}>
          <Avatar name="Misael Ocas" size={48} />
          <div>
            <div style={{ fontWeight: 700 }}>Misael Ocas</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Founder · Patio Constructor</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>misael.ocas@gmail.com</div>
          </div>
        </div>
      </HoverCard>
    </div>
  ),
};

export const ConDelay: StoryObj = {
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
