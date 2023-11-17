import prefetch from "@astrojs/prefetch";
import solidJs from "@astrojs/solid-js";
import vercel from "@astrojs/vercel/serverless";
import presetIcons from "@unocss/preset-icons";
import { defineConfig } from "astro/config";
import rehypeAddClasses from "rehype-add-classes";
import { presetTypography, presetUno } from "unocss";
import Unocss from "unocss/astro";

// https://astro.build/config
export default defineConfig({
	integrations: [
		solidJs(),
		Unocss({
			presets: [
				presetIcons(),
				presetUno({ dark: "media" }),
				presetTypography(),
			],
			theme: {
				fontFamily: {
					serif: ['"Roboto Slab"', "serif"],
				},
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
		prefetch(),
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
	vite: {
		ssr: {
			noExternal: ['solid-dismiss']
		}
	},
	output: 'hybrid',
	adapter: vercel(),
});
