const { getLoader, loaderByName } = require('@craco/craco');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.plugins = [new TsconfigPathsPlugin()];

      /**
       * TODO: Figure out a better approach of compiling packages outside of `src` (eg. by using project references)
       *
       * Let Babel compile outside of `src`
       */
      const { match } = getLoader(config, loaderByName('babel-loader'));

      Object.assign(match.loader, {
        include: undefined,
        exclude: /node_modules/,
      });

      return config;
    },
  },
};
