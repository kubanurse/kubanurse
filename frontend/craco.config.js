module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ignore source map warnings from react-datepicker
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/react-datepicker/,
          message: /Failed to parse source map/,
        },
      ];
      return webpackConfig;
    },
  },
};
