import js from '@eslint/js';
import globals from 'globals';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    { ignores: ['dist', 'node_modules', 'coverage'] },
    js.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.node,
            parser: tsParser,
        },
        plugins: {
            '@typescript-eslint': tseslintPlugin,
        },
        rules: {
            ...tseslintPlugin.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'warn' // Standard for backend to encourage using logger
        },
    },
];
