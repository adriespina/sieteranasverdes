// eslint.config.js (flat config)

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import astroParser from "astro-eslint-parser";
import astro from "eslint-plugin-astro";
import typescriptParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // Reglas base de JavaScript
  js.configs.recommended,

  // Reglas base de TypeScript (sin type-checking)
  ...tseslint.configs.recommended,

  // Reglas de Astro (incluye parser y mejores prácticas)
  ...astro.configs["flat/recommended"],
  // Accesibilidad (requiere eslint-plugin-jsx-a11y)
  ...astro.configs["flat/jsx-a11y-recommended"],

  // Desactiva reglas que chocan con Prettier
  eslintConfigPrettier,

  // Opciones globales (navegador + node)
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Reglas y parser específicos para archivos .astro
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        // Habilita TS/JS dentro de <script> en .astro
        parser: typescriptParser,
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      // Mantén consistencia de indentación mixta en casos raros
      "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
    },
  },

  // TS/TSX y JS/JSX (incluye JS embebido en .astro)
  {
    files: ["**/*.{ts,tsx}", "**/*.{js,jsx}", "**/*.astro/*.js"],
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
      // Desactivamos la base y usamos la de TS (mejor)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
    },
  },

  // Rutas/archivos ignorados por ESLint
  {
    ignores: ["dist", "node_modules", ".github", ".astro", "types.generated.d.ts"],
  },
];
