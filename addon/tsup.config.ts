import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/manager.tsx', 'src/types.ts'],
  format: ['esm'],
  clean: true,
  dts: true,
  inject: ['react-shim.js'],
  external: [
    'react',
    'react-dom',
    'storybook/manager-api',
    'storybook/internal/components',
    'storybook/theming',
    '@storybook/icons',
  ],
  tsconfig: 'tsconfig.build.json',
});
