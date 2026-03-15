import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});
const projects = defineCollection({
	schema: z.object({
		title: z.string(),
		description: z.string(),
		github: z.string().optional(),
		pubDate: z.date(),
	}),
});

const labs = defineCollection({
	schema: z.object({
		title: z.string(),
		pubDate: z.date(),
		description: z.string(),
	}),
});

const notes = defineCollection({
	schema: z.object({
		title: z.string(),
		pubDate: z.date(),
	}),
});
export const collections = { blog, projects, labs, notes };
