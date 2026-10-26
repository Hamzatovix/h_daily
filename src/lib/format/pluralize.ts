/** Склонение существительного по числу (ru): 1 минута, 2 минуты, 5 минут. */
export function pluralizeRu(n: number, forms: [one: string, few: string, many: string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export function readingTimeLabel(minutes: number): string {
  return `${minutes} ${pluralizeRu(minutes, ['минута', 'минуты', 'минут'])} чтения`;
}
