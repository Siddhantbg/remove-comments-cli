import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  target: 'node18',
  banner: { js: '' },
  splitting: false,
  clean: true,
  outDir: 'dist',
  outExtension: () => ({ js: '.cjs' })
}); 