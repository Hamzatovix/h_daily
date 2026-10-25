import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tomeColor = z.enum(['cobalt', 'carmine', 'emerald', 'plum', 'minium', 'petrol']);

const tomes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/tomes' }),
  schema: z.object({
    number: z.number().int().positive(),
    title: z.string(),
    color: tomeColor,
    lede: z.string(),
    cover: z.string(),
    coverSvg: z.string().optional(),
    coverAlt: z.string(),
    publishedAt: z.coerce.date().nullable(),
    status: z.enum(['published', 'draft']),
  }),
});

// Коллекция articles — шаг 2 (docs/roadmap.md).
export const collections = { tomes };
