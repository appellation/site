import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import rehypeAddClasses from "rehype-add-classes";

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
	fonts: [
		{
			provider: fontProviders.bunny(),
			name: "Roboto Slab",
			cssVariable: "--font-serif",
			weights: [300, 400, 500, 700, 900],
			fallbacks: ["ui-serif", "Georgia", "serif"],
		},
		{
			provider: fontProviders.bunny(),
			name: "Roboto Mono",
			cssVariable: "--font-mono",
			weights: [300],
			fallbacks: ["ui-monospace", "monospace"],
		},
	],
	site: "https://wnelson.dev",
	markdown: {
		rehypePlugins: [
			[
				rehypeAddClasses,
				{
					"section.footnotes": "text-sm border-t border-stone-400",
				},
			],
		],
	},
	adapter: cloudflare(),
	prefetch: {
		prefetchAll: true,
	},
	vite: {
		plugins: [tailwindcss()],
		define: {
			setImmediate: "setTimeout",
			clearImmediate: "clearTimeout",
		},
		resolve: {
			alias: import.meta.env.PROD && {
				"react-dom/server": "react-dom/server.edge",
			},
		},
	},
});
