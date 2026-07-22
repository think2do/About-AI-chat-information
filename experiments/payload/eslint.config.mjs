import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'tests/**',
    'playwright.config.ts',
    'vitest.config.mts',
    'vitest.setup.ts',
    'src/payload-types.ts',
    'src/app/(payload)/admin/importMap.js',
  ]),
])
