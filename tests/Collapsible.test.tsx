import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../src/components/Collapsible';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

describe('Collapsible', () => {
  it('content stays mounted; closed = inert (no hidden), opens on trigger click', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Body content</CollapsibleContent>
      </Collapsible>
    );
    const viewport = container.querySelector('.collapsible__viewport') as HTMLElement;
    const content = container.querySelector('.collapsible__content') as HTMLElement;
    // Mounted (so CSS can animate it) — NOT removed via `hidden`/display:none.
    expect(content).not.toBeNull();
    expect(content).not.toHaveAttribute('hidden');
    expect(screen.getByText('Body content')).toBeInTheDocument();
    // Closed: inert gates focus + the a11y tree; data-state on both nodes.
    expect(content).toHaveAttribute('inert');
    expect(content.getAttribute('data-state')).toBe('closed');
    expect(viewport.getAttribute('data-state')).toBe('closed');

    fireEvent.click(screen.getByText('Toggle'));
    expect(content).not.toHaveAttribute('inert');
    expect(content.getAttribute('data-state')).toBe('open');
    expect(viewport.getAttribute('data-state')).toBe('open');
  });

  it('respects defaultOpen (open = not inert)', () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible from start</CollapsibleContent>
      </Collapsible>
    );
    const content = container.querySelector('.collapsible__content') as HTMLElement;
    expect(content).not.toHaveAttribute('inert');
    expect(screen.getByText('Visible from start')).toBeInTheDocument();
  });

  it('controlled mode calls onOpenChange and reflects external state via inert', () => {
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
    // Still inert until the parent re-renders with the new `open` value.
    expect(content).toHaveAttribute('inert');

    rerender(
      <Collapsible open={true} onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>
    );
    expect(content).not.toHaveAttribute('inert');
  });

  it('trigger has aria-expanded + aria-controls; data-state contract unchanged', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>
    );
    const trigger = screen.getByText('Toggle');
    const content = container.querySelector('.collapsible__content') as HTMLElement;
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', content.id);
    expect(trigger.getAttribute('data-state')).toBe('closed');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger.getAttribute('data-state')).toBe('open');
  });

  describe('CSS animation (grid-rows, pure CSS)', () => {
    it('viewport animates grid-template-rows 0fr → 1fr by data-state', () => {
      const vp = css.match(/\.collapsible__viewport\s*\{([^}]*)\}/)?.[1] ?? '';
      expect(vp).toMatch(/display:\s*grid/);
      expect(vp).toMatch(/grid-template-rows:\s*0fr/);
      expect(vp).toMatch(/transition:\s*grid-template-rows/);
      expect(css).toMatch(/\.collapsible__viewport\[data-state="open"\]\s*\{\s*grid-template-rows:\s*1fr/);
    });

    it('content clips so it slides (overflow hidden + min-height 0)', () => {
      const content = css.match(/\.collapsible__content\s*\{([^}]*)\}/)?.[1] ?? '';
      expect(content).toMatch(/overflow:\s*hidden/);
      expect(content).toMatch(/min-height:\s*0/);
    });

    it('respects prefers-reduced-motion (no transition)', () => {
      expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.collapsible__viewport\s*\{\s*transition:\s*none/);
    });
  });
});
