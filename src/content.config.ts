import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		subtitle: z.string().optional(),
		publishDate: z
			.string()
			.transform((str) => new Date(str))
			.or(z.date()),
		draft: z.boolean().optional(),
	}),
});

export const collections = { blog };
