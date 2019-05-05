const HtmlWebPackPlugin = require("html-webpack-plugin")
const SFCPlugin = require("react-sfc-loader/dist/plugin")
const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html"
})

module.exports = {
  module: {
    rules: [
      {
        test: /\.sfc$/,
        exclude: /node_modules/,
        use: {
          loader: "react-sfc-loader"
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },

  plugins: [htmlPlugin, new SFCPlugin()]
}
