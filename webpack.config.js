module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'build.js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.web.js', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', {
                targets: {
                  browsers: ["> 1%", "last 2 versions"]
                }
              }],
              'react'
            ],
            plugins: ['babel-plugin-transform-object-rest-spread', 'babel-plugin-transform-class-properties']
          }
        }
      }
    ]
  }
}
