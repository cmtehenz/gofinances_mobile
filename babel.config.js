module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        extensions: ['.js', '.jsx'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@global': './src/global',
          '@assets': './src/assets',
          '@hooks': './src/hooks'
        }
      }],
      ["inline-dotenv"],
    ]
  };
};
