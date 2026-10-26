import type { Root, Element } from 'hast';

/**
 * Вставляет цитату на полях (Sidenote) сразу после абзаца, где rehype-quote
 * нашёл и подчеркнул дословное совпадение. Один раз на статью.
 */
export function rehypeMarginQuote() {
  return (tree: Root, file: { data: { astro?: { frontmatter?: Record<string, unknown> } } }) => {
    const quote = file.data.astro?.frontmatter?.quote;
    if (typeof quote !== 'string' || quote.length === 0) return;

    for (const node of tree.children) {
      if (node.type !== 'element' || node.tagName !== 'p') continue;
      if (!hasQuoteMark(node)) continue;

      const index = tree.children.indexOf(node);
      tree.children.splice(index + 1, 0, buildMarginQuote(quote));
      return;
    }
  };
}

function hasQuoteMark(node: Element): boolean {
  return node.children.some(
    (child) =>
      child.type === 'element' &&
      child.tagName === 'mark' &&
      Array.isArray(child.properties?.className) &&
      (child.properties.className as string[]).includes('quote'),
  );
}

function buildMarginQuote(quote: string): Element {
  return {
    type: 'element',
    tagName: 'aside',
    properties: { className: ['margin-quote'] },
    children: [
      {
        type: 'element',
        tagName: 'blockquote',
        properties: { id: 'quote', className: ['margin-quote-text'] },
        children: [{ type: 'text', value: quote }],
      },
      {
        type: 'element',
        tagName: 'a',
        properties: { href: '#quote', className: ['margin-quote-share'] },
        children: [{ type: 'text', value: 'Поделиться цитатой' }],
      },
    ],
  };
}
