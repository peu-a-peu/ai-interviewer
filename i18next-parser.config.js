// i18next-parser.config.js
export default {
    locales: ['en', 'kr'], // Define the locales you want to support
    output: 'messages/$LOCALE.json', // Where to save translation files
    defaultNamespace: 'common', // Default namespace for translations
    createOldCatalogs: false, // Disable old catalog backups
    lexers: {
      tsx: ['JavascriptLexer'], // Lexer for TypeScript + React
      default: ['JavascriptLexer']
    },
    keySeparator: false, // Don't use key separators
    nsSeparator: false // Don't use namespace separators
  };
  