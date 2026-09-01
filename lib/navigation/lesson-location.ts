export type LessonSectionId = 'easy' | 'present-value' | 'flow' | 'key' | 'compare' | 'formula' | 'check';

const sectionIds = new Set<LessonSectionId>([
  'easy',
  'present-value',
  'flow',
  'key',
  'compare',
  'formula',
  'check',
]);

export function parseLessonSectionHash(hash: string, chapterNumber: number): LessonSectionId | undefined {
  const section = hash.replace(/^#/, '') as LessonSectionId;
  if (!sectionIds.has(section)) return undefined;
  if (section === 'present-value' && chapterNumber !== 2) return undefined;
  return section;
}
