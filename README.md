# storybook-addon-feedback

A Storybook addon that displays a configurable feedback survey in the toolbar. Collect star ratings, multiple-choice answers, and free-text responses from your Storybook users — then forward them to any webhook endpoint.

**[Live Demo →](https://ewice.github.io/storybook-addon-feedback/)** · **[npm →](https://www.npmjs.com/package/storybook-addon-feedback)**

## Repository structure

| Directory | Description                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------- |
| `addon/`  | The published npm package — source, build config, and [full documentation](./addon/README.md). |
| `demo/`   | A Storybook instance used for development and the live demo.                                   |

## Quick start

```bash
npm install storybook-addon-feedback
```

Then register in `.storybook/main.ts`:

```ts
addons: ['storybook-addon-feedback'],
```

And configure via the `feedbackSurvey` parameter in `.storybook/preview.ts`. See the [addon README](./addon/README.md) for the full configuration reference.

## Development

This is a monorepo managed with npm workspaces and [Vite+](https://viteplus.dev).

```bash
# Install dependencies
vp install

# Build the addon
vp run addon:build

# Start the demo Storybook
vp run demo:storybook

# Run checks (format, lint, type-check)
vp check

# Run tests
vp test
```

## License

MIT
