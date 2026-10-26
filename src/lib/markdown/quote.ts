import type { Root, Element, ElementContent } from 'hast';

/** После типографа в тексте неразрывные пробелы, а в quote — обычные: сравниваем без этой разницы. */
function normalizeSpaces(value: string) {
  return value.replace(/ /g, ' ');
}

/**
 * Оборачивает в тексте статьи дословное вхождение `quote` (из шапки) в `<mark class="quote">`.
 * Если фразы нет в тексте — бросает ошибку сборки.
 */
export function rehypeQuote() {
  return (tree: Root, file: { data: { astro?: { frontmatter?: Record<string, unknown> } }; history: string[] }) => {
    const quote = file.data.astro?.frontmatter?.quote;
    if (typeof quote !== 'string' || quote.length === 0) return;

    const normQuote = normalizeSpaces(quote);
    let found = false;

    for (const node of tree.children) {
      if (found) break;
      if (node.type !== 'element' || node.tagName !== 'p') continue;
      const wrapped = wrapQuoteInChildren(node.children, normQuote);
      if (wrapped) {
        node.children = wrapped;
        found = true;
      }
    }

    if (!found) {
      const title = file.data.astro?.frontmatter?.title ?? file.history[0] ?? 'статья';
      throw new Error(
        `Цитата из поля "quote" не найдена дословно в тексте статьи «${title}»: "${quote}"`,
      );
    }
  };
}

function wrapQuoteInChildren(children: ElementContent[], normQuote: string): ElementContent[] | null {
  const starts: number[] = [];
  let fullText = '';
  let cursor = 0;
  for (const child of children) {
    starts.push(cursor);
    if (child.type === 'text') {
      const norm = normalizeSpaces(child.value);
      fullText += norm;
      cursor += norm.length;
    }
  }

  const matchIndex = fullText.indexOf(normQuote);
  if (matchIndex === -1) return null;
  const qStart = matchIndex;
  const qEnd = matchIndex + normQuote.length;

  let firstIdx = -1;
  let lastIdx = -1;
  children.forEach((child, i) => {
    if (child.type !== 'text') return;
    const segStart = starts[i];
    const segEnd = segStart + normalizeSpaces(child.value).length;
    if (segStart < qEnd && segEnd > qStart) {
      if (firstIdx === -1) firstIdx = i;
      lastIdx = i;
    }
  });
  if (firstIdx === -1) return null;

  const result: ElementContent[] = children.slice(0, firstIdx);
  const markChildren: ElementContent[] = [];
  let trailing: ElementContent | null = null;

  for (let i = firstIdx; i <= lastIdx; i++) {
    const child = children[i];
    if (child.type !== 'text') {
      markChildren.push(child);
      continue;
    }
    const segStart = starts[i];
    const localStart = Math.max(0, qStart - segStart);
    const localEnd = Math.min(child.value.length, qEnd - segStart);
    const before = child.value.slice(0, localStart);
    const matched = child.value.slice(localStart, localEnd);
    const after = child.value.slice(localEnd);

    if (i === firstIdx && before) result.push({ type: 'text', value: before });
    if (matched) markChildren.push({ type: 'text', value: matched });
    if (i === lastIdx && after) trailing = { type: 'text', value: after };
  }

  const mark: Element = {
    type: 'element',
    tagName: 'mark',
    properties: { className: ['quote'] },
    children: markChildren,
  };
  result.push(mark);
  if (trailing) result.push(trailing);
  result.push(...children.slice(lastIdx + 1));

  return result;
}
