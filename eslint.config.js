const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "dist/**"],
  },

  // TypeScript files — use the plugin directly to avoid FlatCompat bugs
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },

  // Next.js + Prettier via FlatCompat (no TS plugin here)
  ...compat.extends("next/core-web-vitals", "plugin:prettier/recommended"),

  // Project-specific rule overrides
  {
    rules: {
      semi: ["error", "always"],
      "prettier/prettier": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
];
