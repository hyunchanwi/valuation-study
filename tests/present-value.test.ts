import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { presentValueSection } from '../content/chapters/chapter-02-present-value.ts';
import {
  getLearningSectionSearchText,
  registerLearningSections,
  registeredLearningSections,
  validateLearningSection,
} from '../content/registry.ts';
import { buildPresentValueCurve, calculatePresentValue } from '../lib/calculations/time-value.ts';
import { parseLessonSectionHash } from '../lib/navigation/lesson-location.ts';

const cloneSection = () => structuredClone(presentValueSection);

void test('현재가치 계산은 보충 예제의 원시값·할인계수·표시 반올림값을 반환한다', () => {
  const result = calculatePresentValue({ futureValue: 1_000_000, rate: 0.1, periods: 2 });
  assert.ok(Math.abs(result.discountFactor - 0.8264462809917354) < 1e-12);
  assert.ok(Math.abs(result.presentValue - 826_446.2809917354) < 1e-8);
  assert.equal(result.roundedPresentValue, 826_446);
});

void test('현재가치 계산은 비유한 수·-100% 이하 할인율·음수 기간을 명시적으로 거부한다', () => {
  assert.throws(() => calculatePresentValue({ futureValue: Number.POSITIVE_INFINITY, rate: 0.1, periods: 2 }), /유한한 수/);
  assert.throws(() => calculatePresentValue({ futureValue: 1_000_000, rate: Number.NaN, periods: 2 }), /유한한 수/);
  assert.throws(() => calculatePresentValue({ futureValue: 1_000_000, rate: 0.1, periods: Number.POSITIVE_INFINITY }), /유한한 수/);
  assert.throws(() => calculatePresentValue({ futureValue: 1_000_000, rate: -1, periods: 2 }), /-100%/);
  assert.throws(() => calculatePresentValue({ futureValue: 1_000_000, rate: 0.1, periods: -1 }), /0 이상/);
  assert.throws(() => calculatePresentValue({ futureValue: 1, rate: -0.9999999999999999, periods: 100 }), /안정적으로 계산/);
});

void test('할인율 곡선의 모든 점은 동일 현재가치 계산 함수를 따른다', () => {
  const curve = buildPresentValueCurve(1_000_000, 2, [0, 0.05, 0.1, 0.15, 0.2]);
  assert.equal(curve.length, 5);
  for (const point of curve) {
    const expected = 1_000_000 / ((1 + point.rate) ** 2);
    assert.ok(Math.abs(point.presentValue - expected) < 1e-8);
  }
  assert.ok(curve.every((point, index) => index === 0 || point.presentValue < curve[index - 1].presentValue));
});

void test('등록된 현재가치 콘텐츠는 순서·출처·대체 설명·계산 품질 계약을 통과한다', () => {
  assert.equal(registeredLearningSections[0], presentValueSection);
  assert.deepEqual(validateLearningSection(presentValueSection), []);
  assert.deepEqual(
    presentValueSection.blocks.map((block) => block.id),
    ['pv-intuition', 'pv-definition', 'pv-mechanism', 'pv-formula', 'pv-timeline', 'pv-rate-chart', 'pv-worked-example', 'pv-exam-trap', 'pv-source'],
  );
  const source = presentValueSection.blocks.find((block) => block.type === 'source-note');
  assert.ok(source && source.references.some((reference) => reference.documentLabel === '강의2장(이익기준접근법)1' && reference.pages === '2–11쪽'));
  assert.ok(source && source.references.some((reference) => reference.kind === 'supplement'));
  const searchable = getLearningSectionSearchText(presentValueSection);
  assert.match(searchable, /단리/);
  assert.match(searchable, /826446\.2809917354/);
});

void test('중복 ID와 필수 출처 누락은 콘텐츠 등록 검증에서 실패한다', () => {
  const duplicate = cloneSection();
  duplicate.blocks[1].id = duplicate.blocks[0].id;
  assert.ok(validateLearningSection(duplicate).some((issue) => issue.includes('중복 안정 ID')));

  const missingSource = cloneSection();
  missingSource.blocks = missingSource.blocks.filter((block) => block.type !== 'source-note');
  assert.ok(validateLearningSection(missingSource).some((issue) => issue.includes('출처 블록')));

  const duplicatePoint = cloneSection();
  const visuals = duplicatePoint.blocks.filter((block) => block.type === 'visual');
  if (visuals[0]?.type === 'visual' && visuals[1]?.type === 'visual') visuals[1].visual.points[0].id = visuals[0].visual.points[0].id;
  assert.ok(validateLearningSection(duplicatePoint).some((issue) => issue.includes('중복 안정 ID')));

  assert.throws(() => registerLearningSections([presentValueSection, presentValueSection]), /중복 학습 절/);
});

void test('대체 설명 누락과 예제·그래프·타임라인 계산 불일치는 콘텐츠 검증에서 실패한다', () => {
  const missingAlt = cloneSection();
  const visual = missingAlt.blocks.find((block) => block.type === 'visual');
  assert.ok(visual && visual.type === 'visual');
  if (visual?.type === 'visual') visual.altText = '';
  assert.ok(validateLearningSection(missingAlt).some((issue) => issue.includes('대체 설명')));

  const wrongExample = cloneSection();
  const example = wrongExample.blocks.find((block) => block.type === 'worked-example');
  if (example?.type === 'worked-example') example.calculation.presentValue += 1_000;
  assert.ok(validateLearningSection(wrongExample).some((issue) => issue.includes('예제 현재가치')));

  const wrongChart = cloneSection();
  const chart = wrongChart.blocks.find((block) => block.type === 'visual' && block.visual.kind === 'chart');
  if (chart?.type === 'visual' && chart.visual.kind === 'chart') chart.visual.points[0].presentValue -= 1_000;
  assert.ok(validateLearningSection(wrongChart).some((issue) => issue.includes('그래프 계산값')));

  const wrongRateLabel = cloneSection();
  const rateChart = wrongRateLabel.blocks.find((block) => block.type === 'visual' && block.visual.kind === 'chart');
  if (rateChart?.type === 'visual' && rateChart.visual.kind === 'chart') rateChart.visual.points[0].ratePercent = 99;
  assert.ok(validateLearningSection(wrongRateLabel).some((issue) => issue.includes('할인율 표시')));

  const emptyChart = cloneSection();
  const empty = emptyChart.blocks.find((block) => block.type === 'visual' && block.visual.kind === 'chart');
  if (empty?.type === 'visual' && empty.visual.kind === 'chart') empty.visual.points = [];
  assert.ok(validateLearningSection(emptyChart).some((issue) => issue.includes('그래프 데이터')));

  const wrongTimeline = cloneSection();
  const timeline = wrongTimeline.blocks.find((block) => block.type === 'visual' && block.visual.kind === 'timeline');
  if (timeline?.type === 'visual' && timeline.visual.kind === 'timeline') timeline.visual.points[0].amount += 1;
  assert.ok(validateLearningSection(wrongTimeline).some((issue) => issue.includes('타임라인 현재가치')));

  const staleAnswer = cloneSection();
  const staleExample = staleAnswer.blocks.find((block) => block.type === 'worked-example');
  if (staleExample?.type === 'worked-example') staleExample.answer = '약 1원';
  assert.ok(validateLearningSection(staleAnswer).some((issue) => issue.includes('표시 정답')));

  const unsafeSource = cloneSection();
  const unsafe = unsafeSource.blocks.find((block) => block.type === 'source-note');
  if (unsafe?.type === 'source-note') unsafe.references[0].documentLabel = 'C:\\Users\\student\\lecture.pdf';
  assert.ok(validateLearningSection(unsafeSource).some((issue) => issue.includes('로컬 경로')));
});

void test('2장 현재가치 절은 안정 URL과 검색 진입점을 제공한다', () => {
  const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /'present-value': '현재가치 상세'/);
  assert.match(page, /chapter\.number === 2/);
  assert.match(page, /getLearningSection\('chapter-2', 'present-value'\)/);
  assert.match(page, /document\.getElementById\(section\)/);
  assert.match(page, /target\.focus\(\{ preventScroll: true \}\)/);
  assert.match(page, /searchJump=\{searchJump\?\.section === 'present-value'/);
  assert.equal(parseLessonSectionHash('#present-value', 2), 'present-value');
  assert.equal(parseLessonSectionHash('#present-value', 1), undefined);
  assert.equal(parseLessonSectionHash('#not-a-section', 2), undefined);
});

void test('상세 렌더러와 배포 품질 게이트가 학습 블록·수치 테스트를 연결한다', () => {
  const renderer = readFileSync(new URL('../components/learning/PresentValueLesson.tsx', import.meta.url), 'utf8');
  const workflow = readFileSync(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
  for (const branch of ["case 'concept'", "case 'formula'", "case 'visual'", "case 'worked-example'", "case 'source-note'"]) {
    assert.match(renderer, new RegExp(branch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(renderer, /section\.blocks\.map/);
  assert.ok(workflow.indexOf('npm test') > 0 && workflow.indexOf('npm test') < workflow.indexOf('npm run build:pages'));
});
