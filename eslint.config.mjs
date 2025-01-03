// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  // Your custom configs here
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      'no-console': 'off', // allow console.log in TypeScript files
      'semi': ['error'],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
