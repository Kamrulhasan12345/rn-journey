module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
  ],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.ios.js', '.android.js', '.js', '.json', '.web.js'],
      },
    ],
  ],
};
