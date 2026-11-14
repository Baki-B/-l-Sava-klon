// Reanimated 4 / worklets için babel ayarı. Worklets eklentisi EN SONDA olmalı.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
