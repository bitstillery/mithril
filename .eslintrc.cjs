module.exports = {
    root: true,
    ignorePatterns: ["**/*.d.ts", "**/vendor/**", '**/*.js'],
    overrides: [        {
            files: ['*.{js,ts,tsx}'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 2022,
                tsconfigRootDir: __dirname,
                ecmaFeatures: {
                    jsx: true,
                    es6: true,
                    dom: true,
                },
            },
            env: {
                browser: true,
                es6: true,
                node: true,
            },
            plugins: [
                'import',
                'sort-class-members',
                '@stylistic/js',
                '@typescript-eslint',
            ],
            extends: [
                'eslint:recommended',
            ],
            rules: {
                'no-unused-vars': ['error', {args: 'after-used', argsIgnorePattern: '^_'}],
                'array-bracket-spacing': [2, 'never'],
                'comma-dangle': [2, 'always-multiline'],
                'eol-last': [2, 'always'],
                eqeqeq: [2, 'always'],
                'import/extensions': [2, 'never', {
                    js: 'ignorePackages',
                    ts: 'never',
                    tsx: 'never',
                }],
                'import/first': [2],
                'import/newline-after-import': [2, {count: 1}],
                'import/order': [2,
                    {
                        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
                        'newlines-between': 'always'
                    }
                ],
                indent: ['error', 4],
                'keyword-spacing': [2],
                'lines-between-class-members': [2, 'always', {exceptAfterSingleLine: true}],
                'no-cond-assign': ['error', 'always'],
                'no-console': [2],
                'no-inline-comments': 'off',
                'no-multi-spaces': [2],
                'no-multiple-empty-lines': [2, {max: 1, maxBOF: 0, maxEOF: 0}],
                'object-curly-spacing': [2, 'never'],
                'one-var': 'off',
                'quote-props': [2, 'as-needed'],
                quotes: ['error', 'single'],
                "semi": "off",
                "@typescript-eslint/semi": [2, "never"],
                '@typescript-eslint/member-delimiter-style': [
                    'error',
                    {
                        multiline: {
                        delimiter: 'none',
                        requireLast: true
                        },
                        singleline: {
                        delimiter: 'semi',
                        requireLast: false
                        }
                    }
                ],
                'sort-keys': [0, 'asc'],
                'space-before-blocks': [2],
                'space-infix-ops': [2],
                'sort-vars': [0, {ignoreCase: true}],
                'space-before-function-paren': [2, 'never'],
                'space-in-parens': [2, 'never'],
                'spaced-comment': [2, 'always'],
                '@typescript-eslint/naming-convention': [
                    2,
                    {
                        selector: ['class'],
                        format: ['PascalCase'],
                    },
                    {
                        selector: ['classMethod', 'function'],
                        format: ['snake_case'],
                        leadingUnderscore: 'allow',
                    },
                    {
                        selector: ['variable'],
                        format: ['snake_case', 'UPPER_CASE', 'PascalCase'],
                        leadingUnderscore: 'allow',
                    },
                ],
                'use-isnan': 2,
                '@stylistic/js/max-len': ['error', {
                    code: 250,
                    comments: 250, // Set your desired maximum line length here
                }]
            },
            settings: {},
        },
    ],
}
