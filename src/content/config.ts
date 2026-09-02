import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		subtitle: z.string().optional(),
		showHero: z.boolean().default(true),
		tocDepth: z.number().int().min(2).max(3).default(3),
		project: z.enum(['yonsei-mileage']).optional(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().optional().default(false),
	}),
});

export const collections = { blog };
