import base from "./base.mjs";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  ...base,
  {
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // no hace falta con el JSX transform nuevo
    },
    settings: { react: { version: "detect" } },
  },
];
