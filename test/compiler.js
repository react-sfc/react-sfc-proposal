import path from 'path'
import webpack from 'webpack'
import memoryfs from 'memory-fs'

import SFCLoaderPlugin from '../src/plugin'

export default (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js'
    },
    // resolve: {
    //   modules: ['node_modules']
    // },
    // resolveLoader: {
    //   // Configure how Webpack finds `loader` modules.
    //   modules: ['node_modules']
    // },
    // resolveLoader: {
    //   root: path.join(__dirname, '../node_modules')
    // },
    // resolve: {
    //   modules: [path.join(__dirname, '../node_modules')]
    // },
    module: {
      rules: [
        {
          test: /\.sfc$/,
          loader: path.resolve(__dirname, '../src/react-sfc-loader.js')
        },
        // // this will apply to both plain `.js` files
        // // AND `<script>` blocks in `.vue` files
        // {
        //   test: /\.js$/,
        //   use: {
        //     loader: 'babel-loader',
        //     options: {
        //       presets: ['@babel/preset-env', '@babel/preset-react']
        //       // plugins: ['@babel/plugin-proposal-object-rest-spread']
        //     }
        //   }
        // },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        // this will apply to both plain `.css` files
        // AND `<style>` blocks in `.vue` files
        {
          test: /\.css$/,
          use: ['vue-style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      // make sure to include the plugin!
      new SFCLoaderPlugin()
    ]
  })
  compiler.outputFileSystem = new memoryfs()
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      // debugger
      // console.log({ stats: stats.hasErrors() })
      if (err || stats.hasErrors()) reject(err)
      resolve(stats)
    })
  })
}
