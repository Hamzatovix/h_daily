// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { rehypeTypograf } from './src/lib/markdown/typograf.ts';
import { rehypeQuote } from './src/lib/markdown/quote.ts';
import { rehypeMarginQuote } from './src/lib/markdown/margin-quote.ts';
import { rehypeSidenotes } from './src/lib/markdown/sidenotes.ts';
import { rehypeLedeEndmark } from './src/lib/markdown/lede-endmark.ts';

export default defineConfig({
  // TODO: заменить на настоящий домен, когда выберут хостинг (docs/roadmap.md).
  site: 'https://hamzatovic.daily',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeTypograf, rehypeQuote, rehypeMarginQuote, rehypeSidenotes, rehypeLedeEndmark],
    }),
  },
});
