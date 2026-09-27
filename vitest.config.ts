import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Next resolves `server-only` to an empty module on the server; the npm
      // package's default export throws, which is the client-bundle guard.
      'server-only': fileURLToPath(
        new URL('./node_modules/server-only/empty.js', import.meta.url)
      ),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    clearMocks: true,
    server: {
      deps: {
        // One graphql realm: everything that touches the schema is inlined
        // so yoga's executor and the schema share graphql's instanceof checks.
        inline: ['graphql', /@graphql-tools\//, 'graphql-yoga', /@envelop\//],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/schema/generated.ts', 'src/gql/**'],
    },
  },
})
