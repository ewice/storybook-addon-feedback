import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true
  },
  pack: {
    entry: ['src/manager.tsx', 'src/types.ts'],
    format: ['esm'],
    clean: true,
    dts: true,
    deps: {
      neverBundle: [
        'react',
        'react-dom',
        'storybook/manager-api',
        'storybook/internal/components',
        'storybook/theming',
        '@storybook/icons'
      ]
    },
    tsconfig: 'tsconfig.build.json'
  }
});
