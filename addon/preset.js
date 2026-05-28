function managerEntries(entry = []) {
  return [...entry, require.resolve('./dist/manager.mjs')];
}

async function managerWebpack(config, options) {
  try {
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.DefinePlugin({
        STORYBOOK_FEEDBACK_SURVEY_OPTIONS: JSON.stringify(options || {})
      })
    );
  } catch {
    // webpack package is not installed or failed to load (common in pure Vite setups)
  }
  return config;
}

async function viteFinal(config, options) {
  config.define = {
    ...config.define,
    STORYBOOK_FEEDBACK_SURVEY_OPTIONS: JSON.stringify(options || {})
  };
  config.optimizeDeps = {
    ...config.optimizeDeps,
    include: [
      ...new Set([
        ...(config.optimizeDeps?.include || []),
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@storybook/react'
      ])
    ]
  };
  return config;
}

module.exports = {
  managerEntries,
  managerWebpack,
  viteFinal
};
