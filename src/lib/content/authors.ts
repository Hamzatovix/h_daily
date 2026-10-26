/** Подписи авторов для клапана статьи (design/screens/02-article-belyj-kit.jpg). */
export const AUTHORS = {
  tartt: {
    name: 'Тартт',
    bio: 'Редакционный псевдоним. Пишет о кино, книгах и музыке о том, что теряется при переводе.',
  },
  mansur: {
    name: 'Мансур',
    bio: 'Главный редактор.',
  },
} as const;

export type AuthorKey = keyof typeof AUTHORS;
