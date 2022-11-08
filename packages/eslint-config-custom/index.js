module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "simple-import-sort", "unused-imports"],
  extends: [
    "eslint:recommended",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:json/recommended",
    "plugin:tailwindcss/recommended",
    "prettier",
    "turbo",
  ],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "@next/next/no-img-element": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-imports": "off",
    "no-console": ["warn", { allow: ["info", "warn", "error"] }],
    "simple-import-sort/exports": "warn",
    "simple-import-sort/imports": "warn",
    "unused-imports/no-unused-imports": "error",
  },
};
