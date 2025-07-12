/* eslint-disable no-undef */
/** @type {import('eslint').Linter.Config} */
const config = {
    root: true,
    parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: require.resolve('@typescript-eslint/parser'),
    },
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: [
        '@typescript-eslint',
        'import',
    ],
    globals: {
        process: 'readonly',
        NodeJS: 'readonly',
    },
    rules: {
        // ESLint Core
        'quotes': [
            'error',
            'single',
            { allowTemplateLiterals: true },
        ],
        'eqeqeq': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'no-case-declarations': 'off',
        'no-unsafe-optional-chaining': [
            'error',
            { disallowArithmeticOperators: true },
        ],
        'no-unreachable-loop': 'error',
        'dot-location': [
            'error',
            'property',
        ],
        'key-spacing': 'warn',
        'rest-spread-spacing': 'warn',
        'semi-spacing': 'warn',
        'array-callback-return': 'error',
        'dot-notation': 'error',
        'no-await-in-loop': 'error',
        'no-implicit-coercion': 'error',
        'no-invalid-this': 'error',
        'no-implied-eval': 'error',
        'yoda': [
            'error',
            'never',
        ],
        'comma-style': 'error',
        'camelcase': 'error',
        'eol-last': 'error',
        'arrow-parens': [
            'error',
            'as-needed',
        ],
        'no-lonely-if': 'error',
        'prefer-template': 'error',

        // Import
        'import/newline-after-import': 'error',
        'import/no-nodejs-modules': 'error',

        // @typescript-eslint
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/indent': [
            'error',
            4,
            { SwitchCase: 1, ignoredNodes: ['TSTypeParameterInstantiation'] },
        ],
        '@typescript-eslint/semi': [
            'error',
            'always',
        ],
        '@typescript-eslint/type-annotation-spacing': [
            'warn',
        ],
        '@typescript-eslint/comma-dangle': [
            'error',
            {
                'arrays': 'always-multiline',
                'objects': 'always-multiline',
                'imports': 'always-multiline',
                'exports': 'always-multiline',
                'functions': 'never',
                'enums': 'always-multiline',
                'generics': 'always-multiline',
                'tuples': 'always-multiline',
            },
        ],
        '@typescript-eslint/comma-spacing': 'warn',
        '@typescript-eslint/func-call-spacing': 'warn',
        '@typescript-eslint/space-before-blocks': 'warn',
    },
    overrides: [
        {
            files: '*.vue',
            plugins: ['vue'],
            extends: ['plugin:vue/vue3-recommended'],
            globals: {
                ga: 'readonly',
                cordova: 'readonly',
                __statics: 'readonly',
                __QUASAR_SSR__: 'readonly',
                __QUASAR_SSR_SERVER__: 'readonly',
                __QUASAR_SSR_CLIENT__: 'readonly',
                __QUASAR_SSR_PWA__: 'readonly',
                Capacitor: 'readonly',
                chrome: 'readonly',
            },
            env: {
                'vue/setup-compiler-macros': true,
            },
            rules: {
                'vue/html-indent': [
                    'error',
                    4,
                ],
                'vue/component-tags-order': ['error', {
                    order: ['script', 'template', 'style'],
                }],
                'vue/no-v-html': 'error',
                'vue/block-lang': ['error', {
                    script: {
                        lang: 'ts',
                    },
                    style: {
                        lang: 'scss',
                    },
                    template: {
                        lang: 'html',
                    },
                }],
                'vue/require-default-prop': 'off',
                'vue/component-name-in-template-casing': [
                    'warn',
                    'kebab-case',
                    {
                        registeredComponentsOnly: false,
                    },
                ],
                'vue/multi-word-component-names': 'off',
            },
        },
        {
            files: '*.js',
            env: {
                node: true,
            },
            parserOptions: {
                sourceType: 'script',
            },
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
                'import/no-nodejs-modules': 'off',
            },
        },
        {
            files: 'functions/**',
            rules: {
                'import/no-nodejs-modules': 'off',
            },
        },
        {
            files: 'quasar.conf.js',
            rules: {
                'camelcase': ['error', {
                    properties: 'never',
                }],
            },
        },
    ],
};

module.exports = config;
