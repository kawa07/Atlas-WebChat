const path = require("path");

module.exports = {
  entry: './main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Processa arquivos .js
        exclude: /node_modules/, // Ignora a pasta node_modules
        use: {
          loader: 'babel-loader', // Utiliza o babel-loader
          options: {
            presets: ['@babel/preset-env'] // Preset para transpilar código moderno (ES6+)
          }
        }
      }
    ]
  }
};
