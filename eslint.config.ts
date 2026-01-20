import {defineConfig} from 'eslint/config'
import stylisticPlugin from '@stylistic/eslint-plugin'
import tseslintPlugin from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

export default defineConfig([
	{
		ignores: [
			'node_modules',
			'**/.build-*',
			'**/*.js',
			'**/mithril.js',
			'**/mithril.min.js',
		],
	},
	{
		files: ['**/*.{ts,tsx}'],
		ignores: [
			'**/index.d.ts',
		],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parser: tsparser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2022,
				project: ['./tsconfig.json'],
				ecmaFeatures: {
					jsx: true,
					es6: true,
					dom: true,
				},
			},
		},
		plugins: {
			'@stylistic': stylisticPlugin as any,
			'@typescript-eslint': tseslintPlugin as any,
			import: importPlugin as any,
		},
		rules: {
			'@stylistic/array-bracket-spacing': [2, 'never'],
			'@stylistic/comma-dangle': [2, 'always-multiline'],
			'@stylistic/comma-spacing': [2, {before: false, after: true}],
			'@stylistic/eol-last': [2, 'always'],
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
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
					'newlines-between': 'always',
				},
			],
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/keyword-spacing': [2],
			'@stylistic/lines-between-class-members': [2, 'always', {exceptAfterSingleLine: true}],
			'@stylistic/member-delimiter-style': [
				'error',
				{
					multiline: {
						delimiter: 'none',
						requireLast: true,
					},
					singleline: {
						delimiter: 'semi',
						requireLast: false,
					},
				},
			],
			'@stylistic/no-multi-spaces': [2],
			'@stylistic/no-multiple-empty-lines': [2, {max: 1, maxBOF: 0, maxEOF: 0}],
			'@stylistic/object-curly-spacing': [2, 'never'],
			'one-var': 'off',
			'@stylistic/quote-props': [2, 'as-needed'],
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/semi': [2, 'never'],
			'@stylistic/space-before-blocks': [2],
			'@stylistic/space-before-function-paren': [2, 'never'],
			'@stylistic/space-in-parens': [2, 'never'],
			'@stylistic/space-infix-ops': [2],
			'@stylistic/spaced-comment': [2, 'always'],
			'@typescript-eslint/no-unused-vars': ['error', {
				args: 'all',
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_',
			}],
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
			'no-cond-assign': ['error', 'always'],
			'no-console': [2],
			'no-inline-comments': 'off',
			'sort-keys': [0, 'asc'],
			'sort-vars': [0, {ignoreCase: true}],
			'use-isnan': 2,
		},
		settings: {},
	},
])
