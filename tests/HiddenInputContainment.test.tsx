import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8');

/**
 * Generic guard for the "hidden native input escapes its label" class of bug
 * (fixed for Switch and Checkbox/Radio). A visually-hidden `<input>` positioned
 * `absolute` anchors to the nearest POSITIONED ancestor; if its own wrapper is
 * static, that ancestor is the *consumer's* (a scroll container, a transformed
 * card…), so the input escapes — inflating that ancestor's height and stealing
 * pointer/layout. Any "fancy input" wrapper (`.X input { position: absolute }`)
 * MUST make itself the containing block (`.X { position: relative }`).
 *
 * This scans the source so a NEW control added later can't reintroduce the bug.
 */
describe('hidden absolute inputs are contained by their own wrapper', () => {
  it('every `.<block> input { position: absolute }` has `.<block> { position: relative }`', () => {
    const absInput = /\.([a-z0-9_-]+)\s+input\s*\{[^}]*position:\s*absolute[^}]*\}/g;
    const offenders: string[] = [];
    const seen = new Set<string>();
    for (const m of css.matchAll(absInput)) {
      const block = m[1];
      if (seen.has(block)) continue;
      seen.add(block);
      const wrapperIsRelative = new RegExp(`\\.${block}\\s*\\{[^}]*position:\\s*relative`).test(css);
      if (!wrapperIsRelative) offenders.push(`.${block}`);
    }
    expect(
      offenders,
      `these wrappers hold an absolute <input> but are not position:relative, so the input escapes to the consumer: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('detects at least the known control wrappers (guard is actually scanning)', () => {
    // Sanity: the regex finds the switch + check inputs, so a green result above
    // means they were checked, not that the scan matched nothing.
    const blocks = new Set([...css.matchAll(/\.([a-z0-9_-]+)\s+input\s*\{[^}]*position:\s*absolute[^}]*\}/g)].map((m) => m[1]));
    expect(blocks.has('switch')).toBe(true);
    expect(blocks.has('check')).toBe(true);
  });
});
