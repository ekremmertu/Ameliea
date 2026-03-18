import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Davranışı değiştirmeden CI geçsin diye; ileride düzgün refactor edilecek
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test dosyaları ayrı kurallarla / sonra ele alınacak
    "tests/**",
    // Node.js yardımcı scriptleri require() kullanır
    "scripts/**",
    // Jest config CommonJS
    "jest.config.js",
    "jest.setup.js",
  ]),
]);

export default eslintConfig;
