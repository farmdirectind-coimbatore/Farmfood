import eslintPluginReact from "eslint-plugin-react";

/** @type {import("eslint").Linter.Config} */
export default {
  plugins: {
    react: eslintPluginReact,
  },
  extends: ["next/core-web-vitals", "eslint:recommended", "plugin:react/recommended"],
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: "module",
  },
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // Project specific rules can go here
  },
};
