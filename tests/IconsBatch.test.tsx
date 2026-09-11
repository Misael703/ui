import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as Icons from '../src/components/Icons';

/**
 * v4.3.0 icon batch: 42 more Lucide icons (exact paths from the upstream
 * repo) — printer, undo/redo, save, send, clipboard, receipts, barcodes,
 * store/warehouse, people, chat… Each renders a 24×24 stroke SVG with real
 * geometry. Plus the licence pieces the copy requires: the ISC/MIT notice
 * ships in the tarball and the source header points at it.
 */
const NEW = ['Printer','Undo2','Redo2','Save','Send','Paperclip','FileDown','FileUp','ClipboardList','ClipboardCheck','Archive','XCircle','PlusCircle','MinusCircle','HelpCircle','Ban','Shield','Flag','Pin','ChevronsLeft','ChevronsRight','ArrowUpDown','SlidersHorizontal','TableIcon','Layers','Maximize2','Minimize2','Receipt','Banknote','Calculator','Percent','Barcode','QrCode','ScanLine','Store','Warehouse','Box','UserPlus','UserCheck','MessageSquare','Image','Camera'] as const;

describe('icon batch v4.3.0', () => {
  it.each(NEW)('%s renders a 24×24 currentColor stroke SVG with geometry', (name) => {
    const C = (Icons as Record<string, React.ComponentType<Icons.IconProps>>)[name];
    expect(C, `${name} is exported`).toBeTypeOf('object');
    const { container } = render(<C size={16} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.querySelectorAll('path, line, circle, rect, polyline, polygon').length).toBeGreaterThan(0);
  });
  it('every icon has a distinct displayName (no copy-paste duplicates)', () => {
    const names = NEW.map((n) => (Icons as Record<string, { displayName?: string }>)[n].displayName);
    expect(new Set(names).size).toBe(NEW.length);
  });
});

describe('icon licence notice', () => {
  it('LICENSE-lucide exists with the ISC and Feather MIT notices and ships in the tarball', () => {
    const p = resolve(__dirname, '../LICENSE-lucide');
    expect(existsSync(p)).toBe(true);
    const t = readFileSync(p, 'utf8');
    expect(t).toMatch(/ISC License/);
    expect(t).toMatch(/Lucide Icons and Contributors/);
    expect(t).toMatch(/Cole Bemis/);
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
    expect(pkg.files).toContain('LICENSE-lucide');
  });
  it('Icons.tsx header credits Lucide and points at the notice file', () => {
    const src = readFileSync(resolve(__dirname, '../src/components/Icons.tsx'), 'utf8');
    expect(src).toMatch(/Lucide/);
    expect(src).toMatch(/LICENSE-lucide/);
  });
});
