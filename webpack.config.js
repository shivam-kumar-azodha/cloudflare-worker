const path = require("path");

module.exports = {
  entry: "./worker.js",
  target: "webworker",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "worker.js",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "esbuild-loader",
        options: {
          loader: "js",
          target: "es2015",
        },
      },
    ],
  },
};
