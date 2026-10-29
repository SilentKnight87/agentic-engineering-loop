import js from '@eslint/js';
import globals from 'globals';
export default [
  { ignores: ['node_modules/**', '.verify/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' },
    rules: { 'no-useless-catch': 'error', 'no-warning-comments': 'error' },
  },
];
