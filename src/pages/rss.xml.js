// RSS всех материалов. docs/pages.md → /rss.xml. Черновики не попадают.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { slugFromId } from '../lib/content/slug';
import { AUTHORS } from '../lib/content/authors';

export async function GET(context) {
  const articles = (await getCollection('articles', ({ data }) => data.status === 'published')).sort(
    (a, b) => b.data.order - a.data.order,
  );

  return rss({
    title: 'HAMZATOVIC daily',
    description: 'Независимый журнал о кино, книгах и музыке.',
    site: context.site,
    items: articles.map((entry) => ({
      title: entry.data.title,
      description: entry.data.subtitle,
      author: AUTHORS[entry.data.author].name,
      link: `/tom/${entry.data.tome}/${slugFromId(entry.id)}/`,
    })),
  });
}
