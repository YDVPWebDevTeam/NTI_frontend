import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/** @type {import("eslint").Linter.Config[]} */
export default [
  // Base recommended JS rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Ignored paths
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      'eslint.config.mjs',
      'next.config.ts',
      'postcss.config.mjs',
      'next-env.d.ts',
    ],
  },

  // Type-aware rules for TypeScript source files
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'],
  })),

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },

  // Main rules for all source files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      prettier,
    },

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },

    rules: {
      //
      // General JS
      //
      'no-console':
        process.env.NODE_ENV === 'production'
          ? ['warn', { allow: ['warn', 'error'] }]
          : 'warn',
      'no-param-reassign': 'off',
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'default-case': 'off',
      'consistent-return': 'off',
      'no-unused-expressions': 'off',
      curly: ['error', 'all'],
      'max-params': ['error', 3],
      'no-negated-condition': 'error',
      'no-unneeded-ternary': 'error',
      'require-await': 'error',

      'no-magic-numbers': [
        'warn',
        { ignoreArrayIndexes: true, ignore: [0, 1, -1, 60, 200, 401, 404, 500] },
      ],

      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
      // 'func-style': ['error', 'expression'],
      // 'id-denylist': ['error', 'e', 'cb', 'item', 'i', 'err', 'el'],

      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: ['case', 'default'], next: '*' },
      ],

      //
      // TypeScript
      //
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      //
      // React
      //
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/function-component-definition': 'off',
      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/no-array-index-key': 'off',
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      ],
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],

      //
      // React Hooks
      //
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',

      //
      // Next.js
      //
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      //
      // Accessibility (jsx-a11y)
      //
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/no-aria-hidden-on-focusable': 'error',
      'jsx-a11y/anchor-is-valid': [
        'error',
        { components: ['Link'], aspects: ['invalidHref', 'preferButton'] },
      ],
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': [
        'error',
        { handlers: ['onClick', 'onKeyDown', 'onKeyUp'] },
      ],
      'jsx-a11y/no-static-element-interactions': [
        'error',
        { handlers: ['onClick', 'onKeyDown', 'onKeyUp'] },
      ],
      // 'jsx-a11y/control-has-associated-label': [
      //   'error',
      //   {
      //     ignoreElements: ['audio', 'video'],
      //     ignoreRoles: ['presentation'],
      //     labelAttributes: ['aria-label', 'aria-labelledby'],
      //     controlComponents: ['Button', 'IconButton'],
      //   },
      // ],
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          labelComponents: ['Label'],
          labelAttributes: ['label'],
          controlComponents: ['Input', 'TextField', 'Select', 'Textarea'],
          depth: 3,
        },
      ],
      'jsx-a11y/media-has-caption': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/no-autofocus': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',

      //
      // Imports
      //
      'import/prefer-default-export': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
      ],

      //
      // Prettier
      //
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
    },
  },
];
