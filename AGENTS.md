# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 16 app using the App Router and TypeScript. Primary code lives in `src/`: routes in `src/app`, reusable UI in `src/components`, server/client integrations in `src/services`, shared hooks in `src/hooks`, and utility helpers in `src/lib` and `src/utils`. GraphQL operations and generated types live under `src/schema` and `src/gql`. Static files are in `public/`, Jest setup and mocks are in `test/`, and parser-focused tests also live beside source in `src/store/clippings/__tests__`.

## Build, Test, and Development Commands
Use `pnpm` for all local work.

- `pnpm dev`: run the app locally on port `3101` with Turbo mode.
- `pnpm build`: run GraphQL codegen, then create a production build.
- `pnpm start`: serve the built app with `PORT`.
- `pnpm test`: run the Jest suite in `jest-environment-jsdom`.
- `pnpm test:update`: refresh snapshots, for example `parser.test.ts.snap`.
- `pnpm lint` / `pnpm lint:fix`: check or fix issues with `oxlint`.
- `pnpm format` / `pnpm format:check`: apply or verify formatting with `oxfmt`.
- `pnpm codegen`: regenerate GraphQL client artifacts after schema or `.graphql` changes.

## Coding Style & Naming Conventions
Follow the existing TypeScript + React style: 2-space indentation, single quotes, and semicolons omitted. Prefer PascalCase for React components (`AuthPageShell.tsx`), camelCase for utilities and hooks (`use-screen-size.ts` is an existing exception), and route folders that match URL structure such as `src/app/dash/[userid]/...`. Keep generated files like `src/schema/generated.tsx` and `src/gql/*` out of manual edits.

## Testing Guidelines
Jest collects coverage from `src/**/*.{js,ts,jsx,tsx}` except generated schema output. Name tests `*.test.ts` or place them in `__tests__/`. Keep fast unit tests close to the code when practical, and use `test/setup.ts` plus `test/mocks/` for shared setup. Run `pnpm test` before opening a PR; run `pnpm test:update` only when snapshot changes are intentional.

## Commit & Pull Request Guidelines
Recent history favors Conventional Commit-style messages such as `refactor(auth): extract AuthPageShell...` and `refactor(ui): ...`. Use a clear type/scope prefix like `feat(dash):`, `fix(upload):`, or `refactor(search):`. PRs should explain the user-visible change, note any schema or config updates, link the issue when relevant, and include screenshots for UI work in `src/app` or `src/components`.

## Configuration Tips
Runtime behavior depends on environment variables such as `PORT`, `GIT_COMMIT`, `NEXT_PUBLIC_PP_TOKEN`, and Redis/telemetry values used in deployment. Avoid committing secrets, and document any new env var in the PR description.
