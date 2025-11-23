const fs = require('fs');
const path = require('path');
const blacklist = require('metro-config/src/defaults/exclusionList');
const rnPath = fs.realpathSync(
  path.resolve(require.resolve('react-native/package.json'), '..'),
);
const rnwPath = fs.realpathSync(
  path.resolve(require.resolve('react-native-web/package.json'), '..'),
);

module.exports = {
  resolver: {
    extraNodeModules: {
      // Redirect react-native to react-native-web
      'react-native': rnwPath,
      'react-native-web': rnwPath,
    },
    blacklistRE: blacklist([
      // Since there are multiple copies of react-native, we need to ensure that metro only sees one of them
      // todo: fix this regexp to work generically on multiple platforms
      new RegExp(`${'<FULL PATH TO PROJECT>/node_modules/react-native/'}.*`),
      // This stops "react-native run-web" from causing the metro server to crash if its already running
      new RegExp(`${path.resolve(__dirname, 'web').replace(/[/\\]/g, '/')}.*`),
    ]),
    platforms: ['ios', 'android', 'web'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
