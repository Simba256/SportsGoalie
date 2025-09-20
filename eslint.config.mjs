import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".vercel/**",
      "coverage/**",
      "playwright-report/**",
    ],
    rules: {
      // React specific rules
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",

      // General rules
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "warn",
      "no-debugger": "error",
    }
  },
  {
    // Allow console statements in error logger and utilities
    files: ["lib/errors/*.ts", "lib/utils/*.ts"],
    rules: {
      "no-console": "off",
    }
  },
];

export default eslintConfig;
