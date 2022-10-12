const path = require('path');

const baseConfig = require('./.cracorc');

const playgroundPlugin = {
  plugin: {
    overrideWebpackConfig: ({ webpackConfig }) => ({
      ...webpackConfig,

      entry: path.resolve('./playground/index.tsx'),
    }),
  },
};

module.exports = {
  ...baseConfig,

  plugins: [...(baseConfig.plugins || []), playgroundPlugin],
};
