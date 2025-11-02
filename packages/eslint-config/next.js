import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import pluginNext from "@next/eslint-plugin-next";
import { config as baseConfig } from "./base.js";

/**
 * Next.js ESLint configuration (correct flat config)
 * @type {import("eslint").Linter.Config[]}
 */
export const nextJsConfig = [
    ...baseConfig,

    js.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,

    {
        languageOptions: {
            globals: {
                ...globals.serviceworker,
            },
        },
    },

    {
        plugins: {
            "@next/next": pluginNext,
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs["core-web-vitals"].rules,
        },
    },

    {
        plugins: {
            "react-hooks": pluginReactHooks,
        },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
        },
    },

    eslintConfigPrettier,

    {
        ignores: ["**/node_modules/**", "**/.next/**", "next-env.d.ts"],
    },
];
