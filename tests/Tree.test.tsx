import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tree } from '../src/components/Display3';

const nodes = [
  { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }, { id: 'a2', label: 'A2' }] },
  { id: 'b', label: 'B' },
];

describe('Tree', () => {
  it('exposes tree and treeitem roles', () => {
    render(<Tree nodes={nodes} aria-label="files" />);
    expect(screen.getByRole('tree', { name: 'files' })).toBeInTheDocument();
    // Collapsed: only top-level items are rendered.
    expect(screen.getAllByRole('treeitem')).toHaveLength(2);
  });

  it('exposes exactly one tabbable treeitem (roving tabindex)', () => {
    render(<Tree nodes={nodes} />);
    const tabbable = screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent('A');
  });

  it('starts roving focus on the selected node when provided', () => {
    render(<Tree nodes={nodes} selectedId="b" />);
    const tabbable = screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent('B');
  });

  it('ArrowRight expands a collapsed parent', () => {
    render(<Tree nodes={nodes} />);
    const a = screen.getByRole('treeitem', { name: 'A' });
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(screen.getByRole('treeitem', { name: 'A' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('ArrowDown moves focus to the next visible item', () => {
    render(<Tree nodes={nodes} />);
    const a = screen.getByRole('treeitem', { name: 'A' });
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    expect(screen.getByRole('treeitem', { name: 'B' })).toHaveFocus();
  });

  it('Enter selects the focused node', () => {
    const onSelect = vi.fn();
    render(<Tree nodes={nodes} onSelect={onSelect} />);
    const a = screen.getByRole('treeitem', { name: 'A' });
    a.focus();
    fireEvent.keyDown(a, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('ArrowLeft collapses an expanded parent', () => {
    render(<Tree nodes={nodes} defaultExpanded={['a']} />);
    expect(screen.getByText('A1')).toBeInTheDocument();
    const a = screen.getByRole('treeitem', { name: 'A' });
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    expect(screen.getByRole('treeitem', { name: 'A' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('A1')).not.toBeInTheDocument();
  });
});
