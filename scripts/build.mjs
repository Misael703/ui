// Kit build: tsup (JS + d.ts) → 'use client' directive → PostCSS bundles → static assets.
// One Node script instead of a shell chain so it runs the same on every OS.
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { basename, dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

run('npx tsup');
run('node scripts/add-use-client.mjs');

const css = [
  ['src/styles/index.css', 'dist/styles.css'],
  ['src/styles/fonts.css', 'dist/fonts.css'],
  ['src/styles/tokens.css', 'dist/tokens.css'],
  ['src/presets/elalba/styles.css', 'dist/presets/elalba/styles.css'],
];
mkdirSync(join(root, 'dist/presets/elalba'), { recursive: true });
for (const [from, to] of css) run(`npx postcss ${from} -o ${to}`);

mkdirSync(join(root, 'dist/fonts'), { recursive: true });
cpSync(join(root, 'src/fonts'), join(root, 'dist/fonts'), {
  recursive: true,
  filter: (src) => statSync(src).isDirectory() || /\.woff2$/.test(basename(src)) || basename(src) === 'OFL.txt',
});
cpSync(join(root, 'src/presets/elalba/logos'), join(root, 'dist/presets/elalba/logos'), {
  recursive: true,
  filter: (src) => statSync(src).isDirectory() || !basename(src).startsWith('.'),
});
console.log('build: done');
