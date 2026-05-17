// Post-build: prepend `'use client';` to every emitted JS file.
//
// esbuild (via tsup) strips module-level "use client" string directives during
// bundling/splitting ("...was ignored" warnings), so banners/plugins don't
// survive. Doing it AFTER tsup is the robust fix: nothing strips it anymore.
// Next honors it on the ESM `.mjs` (the kit becomes a client boundary, so a
// Server Component can import it without `createContext is not a function`);
// it is inert in the CJS `.js`. .map and .d.* files are left untouched.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const DIRECTIVE = `'use client';\n`;
let count = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(mjs|js)$/.test(name) || /\.map$/.test(name)) continue;
    const src = readFileSync(full, 'utf8');
    if (src.startsWith(DIRECTIVE) || src.startsWith('"use client"')) continue;
    writeFileSync(full, DIRECTIVE + src);
    count++;
  }
}

walk(dist);
console.log(`add-use-client: prepended to ${count} JS files in dist/`);
