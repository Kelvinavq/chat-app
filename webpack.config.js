// C:\xampp\htdocs\chat-app\webpack.config.js

import path from 'path';

export default {
  entry: './src/Components/Client/Bubble/Bubble_Chat.jsx',
  output: {
    path: path.resolve('dist'),
    filename: 'chat-widget.js',
    library: 'ChatWidget',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
