import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*']
  },
  {
    files: ['*.rules'],
    plugins: {
      'firebase-security': firebaseRulesPlugin
    }
    // Note: The plugin might have specific rules, but often we just use recommended if available in flat config
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
