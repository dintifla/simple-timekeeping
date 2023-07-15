const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("./webpack-plugins/inlineChunkHtmlPlugin.js");
const path = require("path");

const entry = path.join(__dirname, `src/index.ts`);

const htmlGenerator = new HtmlWebpackPlugin({
  template: `src/index.html`,
  // chunks: [componentName],
  inject: "body",
  filename: "Zeitmessung.html",
});

module.exports = {
  entry,
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.html$/i,
        use: "html-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [htmlGenerator, new InlineChunkHtmlPlugin([/.js$/])],
};
