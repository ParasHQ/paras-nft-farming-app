module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: { project: ['./tsconfig.json'] },
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'next/core-web-vitals'],
	rules: {
		'no-undef': 'off',
		'no-mixed-spaces-and-tabs': 'off',
		'@next/next/no-img-element': 'off',
		'react/no-unescaped-entities': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'jsx-a11y/alt-text': 'off',
	},
}
