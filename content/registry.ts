import { calculatePresentValue } from '../lib/calculations/time-value.ts';
import type { LearningSection, VisualBlock, WorkedExampleBlock } from './schema.ts';
import { presentValueSection } from './chapters/chapter-02-present-value.ts';

const nearlyEqual = (left: number, right: number, tolerance = 1e-8) => (
  Math.abs(left - right) <= tolerance * Math.max(1, Math.abs(left), Math.abs(right))
);

const hasText = (value: string) => value.trim().length > 0;

function collectSearchValues(value: unknown): string[] {
  if (typeof value === 'string' || typeof value === 'number') return [String(value)];
  if (Array.isArray(value)) return value.flatMap(collectSearchValues);
  if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(collectSearchValues);
  return [];
}

export function getLearningSectionSearchText(section: LearningSection) {
  return [section.title, section.searchText, ...collectSearchValues(section.blocks)].join(' ');
}

function validateTimeline(block: VisualBlock & { visual: { kind: 'timeline' } }) {
  const issues: string[] = [];
  if (block.visual.points.length !== 2) {
    issues.push(`${block.id}: 현재가치 현금흐름선은 현재와 미래 두 점이어야 합니다.`);
    return issues;
  }

  try {
    const expected = calculatePresentValue({
      futureValue: block.visual.futureValue,
      rate: block.visual.rate,
      periods: block.visual.periods,
    });
    const [present, future] = block.visual.points;
    if (present.time !== 't=0' || present.amount !== expected.roundedPresentValue) {
      issues.push(`${block.id}: 타임라인 현재가치가 계산 함수와 일치하지 않습니다.`);
    }
    if (future.amount !== block.visual.futureValue) {
      issues.push(`${block.id}: 타임라인 미래가치가 입력값과 일치하지 않습니다.`);
    }
  } catch {
    issues.push(`${block.id}: 타임라인 계산 입력이 유효하지 않습니다.`);
  }
  return issues;
}

function validateChart(block: VisualBlock & { visual: { kind: 'chart' } }) {
  const issues: string[] = [];
  if (block.visual.points.length === 0) issues.push(`${block.id}: 그래프 데이터가 없습니다.`);
  for (const point of block.visual.points) {
    try {
      const expected = calculatePresentValue({
        futureValue: block.visual.futureValue,
        periods: block.visual.periods,
        rate: point.rate,
      });
      if (!nearlyEqual(point.presentValue, expected.presentValue)) {
        issues.push(`${block.id}/${point.id}: 그래프 계산값이 현재가치 함수와 일치하지 않습니다.`);
      }
      if (!nearlyEqual(point.ratePercent, point.rate * 100)) {
        issues.push(`${block.id}/${point.id}: 그래프 할인율 표시가 계산 입력과 일치하지 않습니다.`);
      }
    } catch {
      issues.push(`${block.id}/${point.id}: 그래프 계산 입력이 유효하지 않습니다.`);
    }
  }
  return issues;
}

function validateVisual(block: VisualBlock) {
  const issues: string[] = [];
  if (!hasText(block.altText)) issues.push(`${block.id}: 시각자료 대체 설명이 없습니다.`);
  if (!hasText(block.condition)) issues.push(`${block.id}: 시각자료 조건이 없습니다.`);
  if (!hasText(block.observation)) issues.push(`${block.id}: 시각자료 관찰 문장이 없습니다.`);
  return block.visual.kind === 'timeline'
    ? [...issues, ...validateTimeline(block as VisualBlock & { visual: { kind: 'timeline' } })]
    : [...issues, ...validateChart(block as VisualBlock & { visual: { kind: 'chart' } })];
}

function validateWorkedExample(block: WorkedExampleBlock) {
  const issues: string[] = [];
  try {
    const expected = calculatePresentValue({
      futureValue: block.calculation.futureValue,
      rate: block.calculation.rate,
      periods: block.calculation.periods,
    });
    if (!nearlyEqual(block.calculation.discountFactor, expected.discountFactor)) {
      issues.push(`${block.id}: 예제 할인계수가 현재가치 함수와 일치하지 않습니다.`);
    }
    if (!nearlyEqual(block.calculation.presentValue, expected.presentValue)) {
      issues.push(`${block.id}: 예제 현재가치가 현재가치 함수와 일치하지 않습니다.`);
    }
    const expectedAnswer = `약 ${expected.roundedPresentValue.toLocaleString('ko-KR')}원`;
    if (block.answer !== expectedAnswer) issues.push(`${block.id}: 표시 정답이 계산 결과와 일치하지 않습니다.`);
  } catch {
    issues.push(`${block.id}: 예제 계산 입력이 유효하지 않습니다.`);
  }
  return issues;
}

export function validateLearningSection(section: LearningSection) {
  const issues: string[] = [];
  const ids = new Set<string>();

  if (!hasText(section.title)) issues.push(`${section.id}: 절 제목이 없습니다.`);
  if (!hasText(section.searchText)) issues.push(`${section.id}: 검색 텍스트가 없습니다.`);

  const nestedIds = section.blocks.flatMap((block) => block.type === 'visual'
    ? block.visual.points.map((point) => point.id)
    : []);
  for (const id of [section.id, ...section.blocks.map((block) => block.id), ...nestedIds]) {
    if (!hasText(id)) issues.push('빈 안정 ID가 있습니다.');
    if (ids.has(id)) issues.push(`${id}: 중복 안정 ID입니다.`);
    ids.add(id);
  }

  const sources = section.blocks.filter((block) => block.type === 'source-note');
  if (sources.length === 0) issues.push(`${section.id}: 출처 블록이 없습니다.`);
  for (const source of sources) {
    if (source.references.length === 0) issues.push(`${source.id}: 출처 참조가 없습니다.`);
    for (const reference of source.references) {
      if (!hasText(reference.documentLabel) || !hasText(reference.topic)) {
        issues.push(`${source.id}: 문서명 또는 주제가 비어 있습니다.`);
      }
      const publicText = `${reference.documentLabel} ${reference.topic}`.replaceAll('\\', '/');
      if (/^(?:[a-z]:|~|\/)|(?:^|\/)(?:users|home)\//i.test(publicText)) {
        issues.push(`${source.id}: 공개할 수 없는 로컬 경로가 포함되어 있습니다.`);
      }
    }
  }

  for (const block of section.blocks) {
    if (!hasText(block.title)) issues.push(`${block.id}: 블록 제목이 없습니다.`);
    if (block.type === 'concept' && block.paragraphs.length === 0) issues.push(`${block.id}: 개념 설명이 없습니다.`);
    if (block.type === 'formula' && (!hasText(block.expression) || block.symbols.length === 0 || block.conditions.length === 0)) {
      issues.push(`${block.id}: 공식·기호·조건 중 필수 내용이 없습니다.`);
    }
    if (block.type === 'worked-example' && (block.given.length === 0 || !hasText(block.target) || !hasText(block.formulaChoice))) {
      issues.push(`${block.id}: 예제의 주어진 정보·구할 값·공식 선택이 없습니다.`);
    }
    if (block.type === 'visual') issues.push(...validateVisual(block));
    if (block.type === 'worked-example') issues.push(...validateWorkedExample(block));
  }

  return issues;
}

export function assertValidLearningSection(section: LearningSection) {
  const issues = validateLearningSection(section);
  if (issues.length > 0) throw new Error(`학습 콘텐츠 검증 실패:\n${issues.join('\n')}`);
  return section;
}

export function registerLearningSections(sections: LearningSection[]) {
  const keys = new Set<string>();
  return sections.map((section) => {
    const key = `${section.chapterId}/${section.id}`;
    if (keys.has(key)) throw new Error(`${key}: 중복 학습 절입니다.`);
    keys.add(key);
    return assertValidLearningSection(section);
  });
}

export const registeredLearningSections = registerLearningSections([presentValueSection]);

export function getLearningSection(chapterId: string, sectionId: string) {
  return registeredLearningSections.find(
    (section) => section.chapterId === chapterId && section.id === sectionId,
  );
}
