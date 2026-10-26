// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeTypograf } from './src/lib/markdown/typograf.ts';
import { rehypeQuote } from './src/lib/markdown/quote.ts';
import { rehypeSidenotes } from './src/lib/markdown/sidenotes.ts';
import { rehypeLedeEndmark } from './src/lib/markdown/lede-endmark.ts';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeTypograf, rehypeQuote, rehypeSidenotes, rehypeLedeEndmark],
    }),
  },
});
