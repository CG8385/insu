var webpack = require('webpack');
var path = require('path');

var config = {
  context: __dirname + '/public', // `__dirname` is root of project and `src` is source
  entry: {
    app: './app/main.js',
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: 'bundle.js',
  },
};

module.exports = config;