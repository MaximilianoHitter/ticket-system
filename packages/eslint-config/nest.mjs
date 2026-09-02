import base from "./base.mjs";

export default [
  ...base,
  {
    rules: {
      "@typescript-eslint/no-extraneous-class": "off", // Nest usa clases como contenedores de DI
    },
  },
];
