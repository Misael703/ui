import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../src/components/Collapsible';

describe('Collapsible', () => {
  it('content is hidden by default and revealed on trigger click', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>
    );
    // Content stays in the DOM (SSR-friendly) but is hidden via the `hidden` attribute.
    const content = container.querySelector('.collapsible__content') as HTMLElement;
    expect(content).not.toBeNull();
    expect(content).toHaveAttribute('hidden');
    expect(content.getAttribute('data-state')).toBe('closed');

    fireEvent.click(screen.getByText('Toggle'));
    expect(content).not.toHaveAttribute('hidden');
    expect(content.getAttribute('data-state')).toBe('open');
    expect(screen.getByText('Hidden content')).toBeInTheDocument();
  });

  it('respects defaultOpen', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible from start</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Visible from start')).toBeInTheDocument();
  });

  it('controlled mode calls onOpenChange and respects external state', () => {
    const onOpenChange = vi.fn();
    const { container, rerender } = render(
      <Collapsible open={false} onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>
    );
    const content = container.querySelector('.collapsible__content') as HTMLElement;
    fireEvent.click(screen.getByText('Toggle'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Still hidden until the parent re-renders with the new `open` value.
    expect(content).toHaveAttribute('hidden');

    rerender(
      <Collapsible open={true} onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>
    );
    expect(content).not.toHaveAttribute('hidden');
  });

  it('trigger has aria-expanded that reflects open state', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>
    );
    const trigger = screen.getByText('Toggle');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
