import type { Root, Element } from 'hast';

/** Первый абзац статьи получает класс `lede`, последний — точку EndMark. */
export function rehypeLedeEndmark() {
  return (tree: Root) => {
    const paragraphs = tree.children.filter((n): n is Element => n.type === 'element' && n.tagName === 'p');
    if (paragraphs.length === 0) return;

    const first = paragraphs[0];
    first.properties ??= {};
    const existing = first.properties.className;
    first.properties.className = Array.isArray(existing) ? [...existing, 'lede'] : ['lede'];

    const last = paragraphs[paragraphs.length - 1];
    last.children.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['end-mark'], 'aria-hidden': 'true' },
      children: [{ type: 'text', value: '•' }],
    });
  };
}
