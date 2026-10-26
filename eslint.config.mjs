import stylistic from '@stylistic/eslint-plugin';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import { defineConfig, globalIgnores } from 'eslint/config';

const definitions = [
  'const',
  'let',
  'var',
  'type',
  'interface',
  'enum',
  {
    selector:
      'ExportNamedDeclaration[declaration.type=/^(VariableDeclaration|TSTypeAliasDeclaration|TSInterfaceDeclaration|TSEnumDeclaration)$/]',
  },
];

const functions = [
  'function',
  {
    selector: ':matches(ExportNamedDeclaration, ExportDefaultDeclaration)[declaration.type="FunctionDeclaration"]',
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierRecommended,
  {
    files: ['**/*.{js,jsx,ts,tsx,cjs,mjs,cts,mts}'],
    plugins: {
      perfectionist,
      react: reactPlugin,
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: definitions, next: '*' },
        { blankLine: 'any', prev: definitions, next: definitions },
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: 'if', next: '*' },
        { blankLine: 'always', prev: '*', next: ['return', 'throw'] },
        { blankLine: 'always', prev: '*', next: functions },
        { blankLine: 'always', prev: functions, next: '*' },
        { blankLine: 'any', prev: 'function-overload', next: functions },
      ],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      '@stylistic/lines-between-class-members': [
        'error',
        {
          enforce: [
            { blankLine: 'always', prev: '*', next: 'method' },
            { blankLine: 'always', prev: 'method', next: '*' },
          ],
        },
        { exceptAfterOverload: true },
      ],
      'sort-imports': 'off',
      'import/order': 'off',
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          internalPattern: ['^@/'],
          newlinesBetween: 0,
          sortSideEffects: true,
          groups: ['builtin', 'external', 'internal', 'unknown', 'relative-sibling', 'relative-parent'],
          customGroups: [
            { groupName: 'relative-sibling', elementNamePattern: '^\\.(?:/|$)' },
            { groupName: 'relative-parent', elementNamePattern: '^\\.\\.(?:/|$)' },
          ],
        },
      ],
      'perfectionist/sort-named-imports': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
      curly: ['error', 'all'],
      'no-constant-binary-expression': 'error',
      'no-empty': 'error',
      'react/no-array-index-key': 'warn',
    },
  },
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    'components/ui/**',
    'scripts/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
