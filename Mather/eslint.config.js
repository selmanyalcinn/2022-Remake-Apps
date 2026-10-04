const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  globalIgnores(["node_modules/*", ".expo/*", "dist/*", "coverage/*"]),
  expoConfig,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);
