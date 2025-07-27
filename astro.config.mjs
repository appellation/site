import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import rehypeAddClasses from "rehype-add-classes";
import {
	presetTypography,
	presetUno,
	presetWebFonts,
	presetIcons,
} from "unocss";
import Unocss from "unocss/astro";

// https://astro.build/config
export default defineConfig({
	integrations: [
		react(),
		Unocss({
			presets: [
				presetIcons({ warn: true }),
				presetUno({ dark: "media" }),
				presetTypography(),
				presetWebFonts({
					provider: "bunny",
					fonts: {
						serif: {
							name: "Roboto Slab",
							weights: ["300", "400", "500", "700", "900"],
						},
					},
				}),
			],
			injectReset: true,
			theme: {
				animation: {
					durations: {
						"bg-pulse": "4s",
					},
					timingFns: {
						"bg-pulse": "ease-in-out",
					},
					counts: {
						"bg-pulse": "infinite",
					},
					keyframes: {
						"bg-pulse": `{
            0%,
            100% {
              background-position-y: 0%;
            }
            50% {
              background-position-y: 80%;
            }
          }`,
					},
				},
			},
		}),
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
		resolve: {
			alias: import.meta.env.PROD && {
				"react-dom/server": "react-dom/server.edge",
			},
		},
	},
});
