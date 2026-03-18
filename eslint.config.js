import {
	common,
	typescript,
	prettier,
	astro,
	react,
	browser,
	node,
} from "eslint-config-neon";
import tseslint from "typescript-eslint";

// Extract astro-eslint-parser from the neon astro config (it sets the parser globally without a files filter)
const astroParser = astro[1].languageOptions.parser;

export default [
	{ ignores: [".astro/", "dist/"] },
	...common,
	...browser,
	...node,
	...typescript,
	...react,
	...astro,
	...prettier,
	{
		// Override astro-eslint-parser (applied globally by neon/astro) for all non-astro files
		files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
		languageOptions: {
			parser: tseslint.parser,
		},
	},
	// Disable type-aware rules for files not in tsconfig (root config files etc.)
	{
		...tseslint.configs.disableTypeChecked,
		files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
	},
	{
		// Enable type-aware linting for src files (which are in tsconfig.json)
		files: ["src/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
		rules: {
			// Re-enable type-aware rules for src files
			...tseslint.configs.recommendedTypeChecked.rules,
		},
	},
	{
		files: ["**/*.astro"],
		languageOptions: {
			parser: astroParser,
			parserOptions: {
				parser: tseslint.parser,
				project: "./tsconfig.json",
				extraFileExtensions: [".astro"],
			},
		},
	},
	{
		// src files are browser/Astro context — disable node-specific globals rules
		files: ["src/**"],
		rules: {
			"no-restricted-globals": 0,
			"n/prefer-global/url": 0,
		},
	},
	{
		settings: {
			react: {
				// Use explicit version to avoid context.getFilename() call (removed in ESLint 10)
				// which fails when linting .astro files with astro-eslint-parser
				version: "19",
			},
		},
		rules: {
			"react/jsx-filename-extension": 0,
		},
	},
];
