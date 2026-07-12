import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/__tests__/**',
        'src/main.tsx',
        'src/App.tsx',
        'src/App.styles.ts',
        'src/App.types.ts',
        'src/index.css',
        'src/example/**',
        'src/stories/**',
        // Pure TypeScript declaration files — no runtime code, nothing to cover.
        'src/components/form-builder/types/builder.types.ts',
        'src/components/form-builder/types/component.types.ts',
      ],
      thresholds: {
        branches: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
