function managerEntries(entry = []) {
  return [...entry, require.resolve('./dist/manager.mjs')];
}

async function managerWebpack(config, options) {
  try {
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.DefinePlugin({
        STORYBOOK_FEEDBACK_SURVEY_OPTIONS: JSON.stringify(options || {}),
      })
    );
  } catch (err) {
    // webpack package is not installed or failed to load (common in pure Vite setups)
  }
  return config;
}

async function viteFinal(config, options) {
  config.define = {
    ...config.define,
    STORYBOOK_FEEDBACK_SURVEY_OPTIONS: JSON.stringify(options || {}),
  };
  return config;
}

module.exports = {
  managerEntries,
  managerWebpack,
  viteFinal,
};
