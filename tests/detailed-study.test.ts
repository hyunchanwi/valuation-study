import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { findLectureSummaries, getLectureSearchText, lectureSummaries } from '../src/lecture-summaries.ts';
import { scopeOptions, studyNotes } from '../src/claude-study-data.ts';

void test('상세 정리는 강의 전체 흐름과 출처·녹음 상태를 제공한다', () => {
  const scopeIds = scopeOptions.map((scope) => scope.id);
  const coveredScopes = new Set(lectureSummaries.flatMap((lecture) => lecture.scopes));
  assert.deepEqual([...coveredScopes].sort(), ["ch1","ch2","ch3","ch4"].sort());
  assert.equal(new Set(lectureSummaries.map((lecture) => lecture.id)).size, lectureSummaries.length);
  for (const lecture of lectureSummaries) {
    assert.ok(lecture.scopes.every((scope) => scopeIds.includes(scope)));
    assert.ok(lecture.overview && lecture.location && lecture.recordingStatus);
    assert.ok(lecture.sources.length > 0);
    assert.ok(lecture.sections.length >= 3);
    for (const section of lecture.sections) {
      assert.ok(section.title);
      assert.ok(section.paragraphs.length >= 2);
      assert.ok(section.paragraphs.every((paragraph) => paragraph.length >= 30));
    }
  }
});

void test('실제 질문 요지와 별도 복습 문제를 구분하고 상세 본문도 검색한다', () => {
  for (const note of studyNotes) {
    assert.ok(note.questionsAsked.length > 0);
    assert.ok(note.questionsAsked.every((question) => question.trim().length > 0));
    assert.ok(note.question && note.answer);
  }
  const component = readFileSync(new URL('../app/claude-study-notes.tsx', import.meta.url), 'utf8');
  assert.ok(component.includes('함께 공부한 내용 · 강의별 상세 정리'));
  assert.ok(component.includes('내가 질문·헷갈렸던 부분'));
  assert.ok(component.includes('findLectureSummaries(currentScope, query)'));
  assert.ok(component.includes('section.checks?.map'));
  assert.ok(component.includes('note.questionsAsked'));
  assert.ok(component.includes('복습 확인 ·'));
  assert.ok(component.includes('원본을 재검증한 표시는 아닙니다'));
});

void test('GPT 교정·접힌 해설은 본문 검색에 포함되고 장 필터를 유지한다', () => {
  assert.deepEqual(findLectureSummaries('ch3', '분자와 분모').map((lecture) => lecture.id), ['valuation-capital']);
  assert.deepEqual(findLectureSummaries('ch2', '분자와 분모'), []);
  assert.deepEqual(findLectureSummaries('ch3', ' WACC   D1 ').map((lecture) => lecture.id), ['valuation-capital']);
  assert.deepEqual(findLectureSummaries('ch1', '4,703.26'), []);
  assert.deepEqual(findLectureSummaries('ch99'), []);
  assert.equal(findLectureSummaries('all').length, lectureSummaries.length);
  for (const lecture of lectureSummaries) for (const section of lecture.sections) for (const check of section.checks ?? []) {
    assert.ok(check.question && check.answer);
    assert.ok(getLectureSearchText(lecture).includes(check.answer.toLocaleLowerCase()));
  }
  const component = readFileSync(new URL('../app/claude-study-notes.tsx', import.meta.url), 'utf8');
  assert.ok(component.includes('locked ? initialScope : scope'));
  assert.ok(component.includes('별도 복습 확인'));
  assert.ok(component.includes('GPT·Claude'));
  assert.ok(component.includes('20,000자 제한'));
});

void test('예제 4-3의 처분세금·증분감가·NPV는 같은 시간선으로 일치한다', () => {
  const book = 15_000 - (15_000 / 10) * 5;
  const initial = -30_000 + 3_000 - (3_000 - book) * 0.5;
  const depreciation = (30_000 - 600) / 5 - 15_000 / 10;
  const ocf = (3_000 + 3_000) * 0.5 + depreciation * 0.5;
  const cashflows = [initial, ocf, ocf, ocf, ocf, ocf + 600];
  const npv = cashflows.reduce((total, flow, year) => total + flow / 1.1 ** year, 0);
  assert.deepEqual(cashflows, [-24750, 5190, 5190, 5190, 5190, 5790]);
  const content = getLectureSearchText(lectureSummaries.find((lecture) => lecture.id === 'valuation-cashflow')!);
  for (const value of [book, -initial, depreciation, ocf, ocf + 600]) assert.ok(content.includes(value.toLocaleString('en-US')));
  assert.ok(content.includes((-npv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })));
});

void test('예제 8-3은 EPS 정정·시장가중 WACC와 교재 YTM 가정의 불일치를 구별한다', () => {
  const dividend = 2_700 * 0.3;
  const equityCost = dividend / 35_000 + 0.08;
  const marketValues = [40 * 96.044, 500 * 4.8, 2_000 * 3.5];
  const total = marketValues.reduce((sum, value) => sum + value, 0);
  const wacc = (marketValues[0] * 0.054 + marketValues[1] * 0.1 + marketValues[2] * equityCost) / total;
  const content = getLectureSearchText(lectureSummaries.find((lecture) => lecture.id === 'valuation-capital')!);
  assert.equal(dividend, 810);
  assert.ok(content.includes((equityCost * 100).toFixed(4)));
  assert.ok(content.includes((wacc * 100).toFixed(4)));
  assert.ok(content.includes(total.toLocaleString('en-US')));
  const price = (rate: number) => Array.from({ length: 20 }, (_, index) => (index === 19 ? 104 : 4) / (1 + rate) ** (index + 1)).reduce((sum, value) => sum + value, 0);
  let low = 0.04;
  let high = 0.05;
  for (let index = 0; index < 80; index++) {
    const middle = (low + high) / 2;
    if (price(middle) > 96.044) low = middle; else high = middle;
  }
  assert.ok(Math.abs(price((low + high) / 2) - 96.044) < 1e-9);
  assert.ok(content.includes((((low + high) / 2) * 100).toFixed(6)));
  assert.ok(Math.abs(price(0.045) - 96.044) > 2);
  assert.ok(content.includes(price(0.045).toFixed(3)));
  const halfYearYield = (low + high) / 2;
  const nominalAnnualYield = halfYearYield * 2;
  const afterTaxDebtCost = nominalAnnualYield * (1 - 0.4);
  const priceBasedWacc = (marketValues[0] * afterTaxDebtCost + marketValues[1] * 0.1 + marketValues[2] * equityCost) / total;
  const effectiveAnnualYield = (1 + halfYearYield) ** 2 - 1;
  assert.ok(Math.abs(nominalAnnualYield - 0.08597688409388414) < 1e-12);
  assert.ok(content.includes((nominalAnnualYield * 100).toFixed(6)));
  assert.ok(content.includes((afterTaxDebtCost * 100).toFixed(4)));
  assert.ok(content.includes((priceBasedWacc * 100).toFixed(4)));
  assert.ok(priceBasedWacc < wacc);
  assert.ok(Math.abs(priceBasedWacc - 0.08761535721399) < 1e-12);
  assert.ok(effectiveAnnualYield > nominalAnnualYield);
  assert.match(content, /두 wacc 비교는 부채비용을 명목 연율로 통일/);
  assert.match(content, /실효연율.*명목 연율.*섞지 않는다/);
  assert.match(content, /교재.*가정/);
  assert.match(content, /철회/);
});

void test('게시용 데이터는 비공개 경로·산출물 링크를 포함하지 않는다', () => {
  assert.doesNotMatch(JSON.stringify({ lectureSummaries, studyNotes }), /sandbox:|\/Users\/|\/mnt\/data|https?:\/\/[^\s"]*chatgpt\.com\/c\//);
  assert.ok(studyNotes.some((note) => note.source.includes('GPT')));
});

void test('풀이 순서·잔존가치 조건·ARR의 분모 정의를 명시한다', () => {
  const cashflow = lectureSummaries.find((l) => l.id === 'valuation-cashflow')!;
  assert.ok(cashflow.sections.findIndex((s) => s.title.startsWith('대체투자 문제')) < cashflow.sections.findIndex((s) => s.title.startsWith('예제 4-3')));
  assert.match(getLectureSearchText(cashflow), /잔존가치 0/);
  assert.match(getLectureSearchText(cashflow), /600−0=600/);
  const capital = lectureSummaries.find((l) => l.id === 'valuation-capital')!;
  assert.equal(capital.sections.filter((s) => s.title.startsWith('예제 8-3')).length, 4);
  const investment = getLectureSearchText(lectureSummaries.find((l) => l.id === 'valuation-investment')!);
  assert.equal((600-500)/500, 0.2);
  assert.equal((600-500)/1000, 0.1);
  assert.match(investment, /arr=100\/500=20%/);
  assert.match(investment, /npv≈41.32/);
});
