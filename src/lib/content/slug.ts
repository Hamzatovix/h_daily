/** Слаг статьи = имя файла без числового префикса (docs/pages.md). */
export function slugFromId(id: string): string {
  const file = id.split('/').pop() ?? id;
  return file.replace(/^\d+-/, '');
}
