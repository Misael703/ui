import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResizableGroup, ResizablePanel, ResizableHandle } from '../src/components/Resizable';

describe('Resizable', () => {
  it('renders panels with default sizes', () => {
    const { container } = render(
      <ResizableGroup direction="horizontal" ariaLabel="Editor">
        <ResizablePanel id="left" defaultSize={30}>
          <div>Left</div>
        </ResizablePanel>
        <ResizableHandle panelId="left" />
        <ResizablePanel id="right" defaultSize={70}>
          <div>Right</div>
        </ResizablePanel>
      </ResizableGroup>
    );
    expect(screen.getByRole('group', { name: 'Editor' })).toBeInTheDocument();
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
    expect(container.querySelector('.resizable__handle')).toBeInTheDocument();
  });
});
