// Revisión de código: reglas recomendadas de JavaScript y TypeScript, más las de los hooks de React
// (las que detectan errores reales: dependencias de efectos y hooks llamados en condiciones).
// Uso: npm run lint
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'dist-ssr', 'dist-preview', 'node_modules', 'test-results', 'playwright-report', 'tools'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  { files: ['api/**/*.ts', 'server/**/*.ts', 'scripts/**/*.mjs', 'e2e/**/*.ts', '*.config.{js,ts}'], languageOptions: { globals: globals.node } },
)
