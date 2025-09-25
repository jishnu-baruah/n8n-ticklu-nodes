/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	extends: "./.eslintrc.js",

	overrides: [
		{
			files: ['package.json'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			rules: {
				'n8n-nodes-base/community-package-json-name-still-default': 'error',
			},
		},
		{
			files: ['**/*.ts'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			rules: {
				// Allow file naming convention warnings during publish
				'n8n-nodes-base/node-filename-against-convention': 'warn',
				'n8n-nodes-base/node-dirname-against-convention': 'warn',
				'n8n-nodes-base/cred-filename-against-convention': 'warn',
			},
		},
	],
};
