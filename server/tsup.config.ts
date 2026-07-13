import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  sourcemap: true,
  // Workspace package ships TypeScript source, so it must be bundled in.
  noExternal: ['@slip/shared'],
});
