const path = require('path');

module.exports = {
  entry: './src/simple.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'scripts'),
    filename: 'main.js',
  },
};