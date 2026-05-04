import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'react-dom'],
  clean: true,
  treeshake: true,
  // Emit per-module ESM chunks so consumers' bundlers shake unused
  // components. CJS stays a single file (splitting is ESM-only in tsup).
  splitting: true,
  sourcemap: true,
});
