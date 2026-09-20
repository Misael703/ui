import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(__dirname, '..', 'src');
const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.stories.tsx'))
  .map((f) => join(SRC, f));

const EXEMPT_TITLES = /title:\s*'(Internal|Blocks)\//;
const NO_AUTODOCS = /title:\s*'Components\/AppShell'/;

describe('story metas', () => {
  it('found story files', () => { expect(files.length).toBeGreaterThan(40); });

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const rel = file.slice(SRC.length + 1);
    it(`${rel} declares component:`, () => {
      if (EXEMPT_TITLES.test(src)) return;
      expect(src).toMatch(/^\s*component:\s*[A-Z]\w+,/m);
    });
    it(`${rel} declares tags: ['autodocs']`, () => {
      if (EXEMPT_TITLES.test(src) || NO_AUTODOCS.test(src)) return;
      expect(src).toMatch(/tags:\s*\['autodocs'\]/);
    });
    it(`${rel} has an English title`, () => {
      expect(src).toMatch(/title:\s*'(Docs|Foundations|Components|Patterns|Blocks|Internal)\//);
    });
    it(`${rel} does not import another story`, () => {
      expect(src).not.toMatch(/from '\.\/[A-Za-z]+\.stories'/);
    });
  }
});
