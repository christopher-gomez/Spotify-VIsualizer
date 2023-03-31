module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/essential", "eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-unused-vars": "off",
    "vue/no-unused-component": "off",
    "vue/no-reserved-keys": "off",
    "no-undef": "off",
    "vue/multi-word-component-names": "off",
    "no-redeclare": "off",
    "vue/no-mutating-props": "off",
    "no-case-declarations": "off",
    "vue/no-dupe-keys": "off",
    "vue/no-arrow-functions-in-watch": "off",
    "no-empty": "off",
    "no-constant-condition": "off",
    "no-dupe-keys": "off",
    "vue/no-unused-components": "off"
  },
};
