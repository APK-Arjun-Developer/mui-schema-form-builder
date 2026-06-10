import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    'react-hook-form',
    '@hookform/resolvers',
    '@hookform/resolvers/zod',
    'zod',
    // optional peer dependencies — not always installed
    'react-window',
    '@mui/x-date-pickers',
    '@mui/x-date-pickers/DatePicker',
  ],
});
