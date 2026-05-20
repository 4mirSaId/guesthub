const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de'],
  },
  localePath: path.resolve('./public/locales'),
  defaultNamespace: 'common',
  fallbackLng: 'en',
};
