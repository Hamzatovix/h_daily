# Модель контента

Тексты лежат в `src/content/`. Редакция правит Markdown, сайт собирается из него. Позже поверх тех же файлов можно подключить редакторскую панель (Keystatic), и переносить ничего не придётся.

```
src/content/
  tomes/
    tome-1.md                        — том: номер, название, цвет, описание
  articles/
    tome-1/
      01-belyj-kit-s-mott-strit.md   — статьи тома, префикс = порядок в имени файла (для удобства), но порядок задаёт поле order
      02-kolybelnaya-dlya-dambo.md
      03-slova-za-desyat-dollarov.md
      04-mikstejp-dlya-nevidimogo-druga.md
      05-judge-me-by-cover.md        — черновик-заглушка рубрики главреда
  feed/                              — лента (пока пусто)
```

## Том (`tomes`)

| Поле | Тип | Что это |
| --- | --- | --- |
| `number` | число | Номер тома |
| `title` | строка | Название («Второй голос») |
| `color` | `cobalt` \| `carmine` \| `emerald` \| `plum` \| `minium` \| `petrol` | Цвет тома → `data-tome` |
| `lede` | строка | Описание тома для первого экрана |
| `cover`, `coverSvg`, `coverAlt` | строки | Обложка тома |
| `publishedAt` | дата или `null` | Дата выхода. Пока `null`, строку «Следующий том выйдет…» не показываем |
| `status` | `published` \| `draft` | |

Тело файла — одна фраза-итог тома (сейчас не выводится, место под «О томе»).

## Статья (`articles`)

| Поле | Тип | Что это |
| --- | --- | --- |
| `title` | строка | Заголовок |
| `subtitle` | строка | Подзаголовок под заголовком и описание в оглавлении |
| `tome` | число | Номер тома (ссылка на `tomes`) |
| `order` | число | Порядок чтения в томе |
| `section` | `music` \| `film` \| `books` | Раздел (для фильтров ленты позже) |
| `genre` | строка | Подпись над заголовком: «Эссе о музыке», «Кинозаметка», «Колонка о музыке и книгах», «Рубрика главреда» |
| `author` | `tartt` \| `mansur` | Автор. Подпись: «Тартт» / «Мансур» |
| `readingTime` | число или `null` | Минуты чтения. Указаны редакцией, не пересчитывать автоматически |
| `cover` | строка или `null` | `.webp` 1200×1600 |
| `coverSmall` | строка | `-600.webp` для карточек |
| `coverSvg` | строка | Исходник SVG (для большой обложки, по желанию) |
| `coverAlt` | строка | Описание картинки |
| `quote` | строка или `null` | Фраза для цитаты на полях. Должна дословно встречаться в тексте — иначе ошибка сборки |
| `flap` | список | Пункты левого клапана: `label` и `items` (`text`, необязательно `play: true` и `href`) |
| `status` | `published` \| `draft` | Черновики не публикуются, но видны в оглавлении как «скоро» (только для рубрики главреда) |

Тело — Markdown. Сноски — стандартные `[^1]`. Абзацы — через пустую строку. HTML в текстах не используем.

## Пример `src/content.config.ts`

Сверь API с документацией той версии Astro, которая установится: в разных версиях отличается импорт `z`.

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
```

## Обработка текста при сборке (по порядку)

1. Markdown → HTML (сноски GFM включены в Astro по умолчанию).
2. Типограф (`typograf`, `ru`) для текста абзацев и заголовков: неразрывные пробелы, тире, многоточия. Кавычки уже правильные.
3. Rehype-плагин сносок: GFM-сноски → `<sup>` в тексте + элемент на полях (см. `components.md`, Sidenote).
4. Rehype-плагин цитаты: оборачивает точное вхождение `quote` в `<mark class="quote">`. Сравнивать с нормализацией пробелов: после типографа в тексте неразрывные пробелы, а в `quote` — обычные.
5. Первый абзац получает класс `lede`, последний — EndMark.
