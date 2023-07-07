const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("./webpack-plugins/inlineChunkHtmlPlugin.js");
const path = require("path");

const listOfComponents = ["startList", "timekeeping", "evaluation"];

const entry = listOfComponents.reduce((entries, componentName) => {
  entries[componentName] = path.join(__dirname, `src/${componentName}.ts`);
  return entries;
}, {});

const htmlGenerators = listOfComponents.reduce((entries, componentName) => {
  entries.push(
    new HtmlWebpackPlugin({
      template: `src/${componentName}.html`,
      chunks: [componentName],
      inject: "body",
      filename: `${componentName}.html`,
    })
  );
  return entries;
}, []);

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
  plugins: [...htmlGenerators, new InlineChunkHtmlPlugin([/.js$/])],
};
