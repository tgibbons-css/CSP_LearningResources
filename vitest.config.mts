import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  resolve: {alias: {'@docusaurus/Link': fileURLToPath(new URL('./tests/fixtures/Link.tsx', import.meta.url))}},
  test: {environment: 'jsdom', setupFiles: ['./tests/setup.ts'], include: ['tests/**/*.test.tsx'], pool: 'threads', maxWorkers: 2},
});
