import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([globalIgnores([
    "**/tailwind.config.js",
    "src/gql/**/*.ts",
    "src/**/*.mdx",
    "src/types.g.ts",
    "src/schema/generated.tsx",
    "node_modules/**/*",
    ".next/**/*",
    "coverage/**/*",
    "build/**/*",
    "dist/**/*",
]), {
    extends: [...nextCoreWebVitals, ...nextTypescript],

    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-non-null-assertion": "off",
        "react/no-unescaped-entities": "off",
        "react-hooks/exhaustive-deps": "off",
        "@next/next/no-img-element": "off",
        "@next/next/no-html-link-for-pages": "off",
        "prefer-template": "warn",
        "no-useless-escape": "warn",
        // Disable React Compiler rules that conflict with Floating UI and manual memoization patterns
        "react-hooks/preserve-manual-memoization": "off",
        "react-hooks/purity": "off",
        "react-hooks/refs": "off",
    },
}]);