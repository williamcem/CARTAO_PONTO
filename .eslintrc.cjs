const { configure, presets } = require("eslint-kit");

module.exports = configure({
  presets: [
    presets.imports({
      sort: {
        newline: true,
        groups: [
          ["^\\u0000"],
          ["^(child_process|crypto|events|fs|http|https|os|path)(/.*)?$", "^@?\\w"],
          ["^@infra", "^@domain", "^@application"],
          ["^\\."],
        ],
      },
      alias: {
        root: __dirname,
        paths: {
          "@application": "./src/application",
          "@domain": "./src/domain",
          "@infra": "./src/infra",
        },
      },
    }),
    presets.node(),
    presets.typescript({ root: __dirname }),
    presets.prettier({ printWidth: 120, endOfLine: "crlf" }),
  ],
  extend: {
    rules: {
      "@typescript-eslint/consistent-type-definitions": "off",
    },
    ignorePatterns: [".eslintrc.cjs", "commitlint.config.cjs", "vitest.config.mts"],
  },
});
