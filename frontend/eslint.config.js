import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Allow `any` type — common in API responses and dynamic data
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unused variables — they may be used in the future or for readability
      '@typescript-eslint/no-unused-vars': 'warn',
      // Allow setState inside useEffect — this is a common pattern for initial data loading
      'react-hooks/set-state-in-effect': 'off',
      // Allow functions/constants exported alongside components (shadcn/ui pattern)
      'react-refresh/only-export-components': 'off',
      // Allow impure function calls like Date.now() during render
      'react-hooks/purity': 'off',
      // Allow accessing variables before declaration (hoisting)
      'react-hooks/immutability': 'off',
      // Downgrade exhaustive-deps to warning only
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])

