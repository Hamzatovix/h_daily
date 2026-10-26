import Typograf from 'typograf';
import { visit, SKIP } from 'unist-util-visit';
import type { Root } from 'hast';

const SKIP_TAGS = new Set(['a', 'sup', 'code', 'pre', 'script', 'style']);

/** Прогоняет текст статьи через typograf (ru): неразрывные пробелы, тире, многоточия. */
export function rehypeTypograf() {
  const tp = new Typograf({ locale: 'ru' });

  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type === 'element' && SKIP_TAGS.has(node.tagName)) {
        return SKIP;
      }
      if (node.type === 'text' && node.value.trim() !== '') {
        node.value = tp.execute(node.value);
      }
    });
  };
}
