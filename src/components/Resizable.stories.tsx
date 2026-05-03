import type { Meta, StoryObj } from '@storybook/react';
import { ResizableGroup, ResizablePanel, ResizableHandle } from './Resizable';

export default { title: 'Layout/Resizable', tags: ['autodocs'] } as Meta;

const Pane = ({ children, bg = 'var(--bg-subtle)' }: { children: React.ReactNode; bg?: string }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      color: 'var(--fg-muted)',
    }}
  >
    {children}
  </div>
);

export const Horizontal: StoryObj = {
  render: () => (
    <div style={{ width: 640, height: 280, border: '1px solid var(--border-default)', borderRadius: 8 }}>
      <ResizableGroup direction="horizontal" ariaLabel="Panel horizontal">
        <ResizablePanel id="left" defaultSize={30}>
          <Pane>Izquierda 30%</Pane>
        </ResizablePanel>
        <ResizableHandle panelId="left" />
        <ResizablePanel id="middle" defaultSize={40}>
          <Pane bg="var(--bg-surface)">Centro 40%</Pane>
        </ResizablePanel>
        <ResizableHandle panelId="middle" />
        <ResizablePanel id="right" defaultSize={30}>
          <Pane>Derecha 30%</Pane>
        </ResizablePanel>
      </ResizableGroup>
    </div>
  ),
};

export const Vertical: StoryObj = {
  render: () => (
    <div style={{ width: 480, height: 360, border: '1px solid var(--border-default)', borderRadius: 8 }}>
      <ResizableGroup direction="vertical" ariaLabel="Panel vertical">
        <ResizablePanel id="top" defaultSize={60} minSize={20}>
          <Pane>Arriba 60%</Pane>
        </ResizablePanel>
        <ResizableHandle panelId="top" />
        <ResizablePanel id="bottom" defaultSize={40} minSize={20}>
          <Pane bg="var(--bg-surface)">Abajo 40%</Pane>
        </ResizablePanel>
      </ResizableGroup>
    </div>
  ),
};
