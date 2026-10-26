import type { Root, Element, ElementContent, RootContent } from 'hast';

/**
 * Превращает стандартные GFM-сноски (`[^1]` → `<sup><a>` + секция `Footnotes` в конце)
 * в сноски на полях: убирает секцию, вставляет `<aside class="sidenote">` сразу после
 * абзаца, в котором встретилась ссылка на неё.
 */
export function rehypeSidenotes() {
  return (tree: Root) => {
    const sectionIndex = tree.children.findIndex(
      (node) => node.type === 'element' && node.tagName === 'section' && node.properties?.dataFootnotes !== undefined,
    );
    if (sectionIndex === -1) return;

    const [section] = tree.children.splice(sectionIndex, 1) as Element[];
    const notes = collectFootnoteContents(section);

    const newChildren: RootContent[] = [];
    for (const node of tree.children) {
      newChildren.push(node);
      if (node.type !== 'element' || node.tagName !== 'p') continue;
      for (const num of findFootnoteRefs(node)) {
        const content = notes.get(num);
        if (!content) continue;
        newChildren.push(buildSidenote(num, content));
      }
    }
    tree.children = newChildren;
  };
}

function collectFootnoteContents(section: Element): Map<string, ElementContent[]> {
  const notes = new Map<string, ElementContent[]>();
  const list = section.children.find((n): n is Element => n.type === 'element' && n.tagName === 'ol');
  for (const li of list?.children ?? []) {
    if (li.type !== 'element' || li.tagName !== 'li') continue;
    const num = String(li.properties?.id ?? '').replace('user-content-fn-', '');
    const p = li.children.find((n): n is Element => n.type === 'element' && n.tagName === 'p');
    const content = (p?.children ?? []).filter(
      (n) => !(n.type === 'element' && n.tagName === 'a' && n.properties?.dataFootnoteBackref !== undefined),
    );
    notes.set(num, content);
  }
  return notes;
}

function findFootnoteRefs(node: Element): string[] {
  const refs: string[] = [];
  const walk = (n: ElementContent) => {
    if (n.type === 'element' && n.tagName === 'a' && n.properties?.dataFootnoteRef !== undefined) {
      refs.push(String(n.properties?.id ?? '').replace('user-content-fnref-', ''));
    }
    if (n.type === 'element') n.children.forEach(walk);
  };
  node.children.forEach(walk);
  return refs;
}

function buildSidenote(num: string, content: ElementContent[]): Element {
  return {
    type: 'element',
    tagName: 'aside',
    properties: { className: ['sidenote'], dataSidenote: num, 'aria-label': `Сноска ${num}` },
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['sidenote-number'] },
        children: [{ type: 'text', value: num }],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['sidenote-text'] },
        children: content,
      },
    ],
  };
}
