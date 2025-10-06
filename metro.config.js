const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Добавляем поддержку для абсолютных путей
config.resolver.alias = {
  '@': './src',
};

module.exports = config;
