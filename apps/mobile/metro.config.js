const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file types if needed
config.resolver.assetExts.push(
  // Add any additional asset extensions here
  'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'
);

module.exports = config;
