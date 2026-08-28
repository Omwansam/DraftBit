import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      // `configs.flat` is the flat-config namespace in eslint-plugin-react-hooks
      // v7; the top-level `recommended-latest` there is still eslintrc-shaped.
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Core no-unused-vars cannot see that `<motion.div>` or `<Icon />` uses
      // the imported binding, so it reports live imports as dead. This rule
      // marks JSX-referenced identifiers as used.
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // Context modules deliberately export their own consumer hook next to the
      // provider, and a few component modules export a companion helper. That
      // costs fast-refresh granularity in those files only, which is a trade we
      // are making knowingly rather than a mistake to flag on every run.
      'react-refresh/only-export-components': ['warn', {
        allowExportNames: [
          'useAuth', 'useData', 'useTheme', 'useToast',
          'COLLECTIONS', 'STATUS_MAP', 'Badge', 'StatusBadge', 'ChartTable',
        ],
      }],
    },
  },
])
