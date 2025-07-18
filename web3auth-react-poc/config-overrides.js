const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve('buffer'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'),
    url: require.resolve('url'),
    zlib: require.resolve('browserify-zlib'),
    path: require.resolve('path-browserify'),
    process: require.resolve('process/browser'),
    util: require.resolve('util'),
    fs: false,
    net: false,
    tls: false,
  };

  // Provide global variables
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );

  // Explicitly define process.env
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.version': JSON.stringify(process.version),
      'process.platform': JSON.stringify(process.platform),
    })
  );

  // Ignore warnings
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /Critical dependency/,
    /Can't resolve/,
  ];

  // Module rules adjustment
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false, // disable the behaviour
    },
  });

  return config;
}; 