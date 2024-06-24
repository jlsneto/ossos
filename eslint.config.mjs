import js         from '@eslint/js';
import globals    from 'globals';
import tsPlugin   from '@typescript-eslint/eslint-plugin';
import tsParser   from '@typescript-eslint/parser';
import stylistic  from '@stylistic/eslint-plugin';

// https://eslint.style/rules

export default [
    js.configs.recommended,

    {
        files: [
            '**/*.ts',
            '**/*.mjs',
            '**/*.js',
            '*.mjs',
        ],

        plugins:{
            '@typescript-eslint': tsPlugin,
            '@stylistic': stylistic,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2022,
            },
        },

        ignores: [
            'node_modules',
        ],

        rules: {
            ...tsPlugin.configs['eslint-recommended'].rules,
            ...tsPlugin.configs['recommended'].rules,

            '@typescript-eslint/no-explicit-any':0,
            '@typescript-eslint/no-array-constructor': 0,

            '@stylistic/indent': ["warn", 4, {
                SwitchCase: 1,
                VariableDeclarator: 2,
                ArrayExpression: 'first',
            }],

            '@stylistic/semi': ['warn', 'always'],
            "@stylistic/semi-spacing": ["warn", {"before": false, "after": true }],
            "@stylistic/semi-style": ["warn", "last"],


            '@stylistic/quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: false }],

            '@stylistic/space-in-parens': ["warn", "always", { "exceptions": ["empty"] } ],

            '@stylistic/arrow-spacing': ["warn", { "before": false, "after": false }],

            "@stylistic/template-curly-spacing": ["warn", "never"],
            '@stylistic/array-bracket-spacing': ["warn", "always"],
            '@stylistic/comma-spacing': ["warn", { "before": false, "after": true }],
            '@stylistic/function-call-spacing': ["warn", "never"],
            '@stylistic/no-mixed-spaces-and-tabs': ["warn"],
            '@stylistic/no-trailing-spaces': ["warn"],
            '@stylistic/object-curly-spacing': ["warn", "always"],
            '@stylistic/space-before-blocks': ["warn", { "functions": "never", "keywords": "never", "classes": "always" }],

            '@stylistic/space-unary-ops':['warn', {"words": true, "nonwords": false} ],

            "@stylistic/switch-colon-spacing": ["error", {"after": true, "before": false}],

            '@stylistic/array-element-newline': ['warn', 'consistent'],
            '@stylistic/space-before-function-paren': [
                'warn',
                {
                    anonymous: 'never',
                    named: 'never',
                    asyncArrow: 'always',
                },
            ],

            '@stylistic/brace-style':['warn', '1tbs', { 'allowSingleLine': true } ],

            '@stylistic/max-len': ['off'],
            '@stylistic/no-multi-spaces': ['off'],
            '@stylistic/no-console': ['off'],

        },

    },
]