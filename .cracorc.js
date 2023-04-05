const { getLoader, loaderByName, addPlugins } = require('@craco/craco');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: {
    configure: (config) => {
      addPlugins(config, [new NodePolyfillPlugin()]);

      /**
       * Replace `resolve.plugins` to allow compiling packages outside of `src`
       */
      config.resolve.plugins = [new TsconfigPathsPlugin()];

      /**
       * Fix build errors after adding @biconomy/mexa@v3.0.6
       *
       * TODO: check if this fix is still relevant when the lib's new version is available
       */
      config.resolve.fallback = {
        net: false,
        tls: false,
      };

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

      /**
       * Suppress warning about missing source maps from 3rd party libraries
       */
      config.ignoreWarnings = [/Failed to parse source map/];

      return config;
    },
  },
};
