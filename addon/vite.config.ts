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
    // Storybook's manager only exposes `react`, `react-dom`, and
    // `react-dom/client` as globals (see storybook/dist/manager/globals.js) —
    // it does NOT externalize `react/jsx-runtime`. If we emit the automatic
    // JSX runtime, Storybook bundles its own copy of React's dev jsx-runtime,
    // which reads `ReactSharedInternals` from the externalized `react` global.
    // That global is Storybook's React build, so the internals are undefined
    // and the manager crashes. Compiling JSX with the classic runtime keeps us
    // on `React.createElement`/`React.Fragment` from the externalized `react`,
    // which is stable across React versions.
    inputOptions(options) {
      options.transform = {
        ...options.transform,
        jsx: 'react',
        inject: {
          ...options.transform?.inject,
          React: ['react', '*']
        }
      };
      return options;
    },
    tsconfig: 'tsconfig.build.json'
  }
});
