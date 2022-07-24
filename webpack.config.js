const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
        '@parser': path.resolve(__dirname, 'src/parser'),
        '@ast': path.resolve(__dirname, 'src/parser/ast'),
        '@tokeniser': path.resolve(__dirname, 'src/tokeniser'),
        '@tokens': path.resolve(__dirname, 'src/tokeniser/tokens'),
        '@matchers': path.resolve(__dirname, 'src/tokeniser/matchers'),
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: 'parser.js',
    path: path.resolve(__dirname, 'docs/js'),
    library: 'parser'
  }
};