const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.plugins = [new TsconfigPathsPlugin()];

      /**
       * TODO: Figure out a better approach of compiling pacakges outside of `src` (eg. by using project references)
       *
       * Let Babel compile outside of `src`
       */
      const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
      const tsRule = oneOfRule.oneOf.find((rule) => rule.test.toString().includes("ts|tsx"));
      tsRule.include = undefined;
      tsRule.exclude = /node_modules/;

      return config;
    },
  },
};
