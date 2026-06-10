import { defineConfig } from 'tsup';

// Per-component entries so the ESM build emits one file per source module
// (Button.mjs, Modal.mjs, etc.) plus shared chunks for cross-imports
// (cx, Icons). The barrel `dist/index.mjs` re-exports from siblings,
// turning into a tiny pass-through. Consumers' bundlers can drop
// unused components reliably even when importing from the barrel.
//
// `splitting: true` is ESM-only in tsup. CJS gets each entry bundled
// independently — the per-component .js files are self-contained and
// inflate the tarball, but no consumer using CJS reads them (they read
// the barrel `dist/index.js`). Trade-off accepted.
export default defineConfig({
  entry: [
    'src/index.ts',
    'src/brand.ts',
    'src/locale/index.ts',
    'src/utils/*.ts',
    'src/hooks/*.ts',
    'src/components/!(*.stories).tsx',
    'src/presets/elalba/defaults.ts',
    'src/cl/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'react-dom'],
  clean: true,
  treeshake: true,
  splitting: true,
  sourcemap: true,
  // NOTE: `'use client'` is added post-build by scripts/add-use-client.mjs.
  // esbuild strips module-level "use client" string directives during
  // bundling/splitting (a tsup banner/plugin gets stripped too), so it must
  // be prepended after tsup runs. See that script for the why.
});
