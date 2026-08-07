import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@queueflow/config': path.resolve(__dirname, './packages/config/src/index.ts'),
      '@queueflow/database': path.resolve(__dirname, './packages/database/src/index.ts'),
      '@queueflow/logger': path.resolve(__dirname, './packages/logger/src/index.ts'),
      '@queueflow/monitoring': path.resolve(__dirname, './packages/monitoring/src/index.ts'),
      '@queueflow/redis-engine': path.resolve(__dirname, './packages/redis-engine/src/index.ts'),
      '@queueflow/shared': path.resolve(__dirname, './shared/src/index.ts'),
    },
  },
});
