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

const flapItem = z.object({
  text: z.string(),
  play: z.boolean().optional(),
  href: z.string().optional(),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    tome: z.number().int(),
    order: z.number().int(),
    section: z.enum(['music', 'film', 'books']),
    genre: z.string(),
    author: z.enum(['tartt', 'mansur']),
    readingTime: z.number().int().nullable(),
    cover: z.string().nullable(),
    coverSmall: z.string().optional(),
    coverSvg: z.string().optional(),
    coverAlt: z.string(),
    quote: z.string().nullable(),
    flap: z.array(z.object({ label: z.string(), items: z.array(flapItem) })).max(4),
    status: z.enum(['published', 'draft']),
  }),
});

export const collections = { tomes, articles };
