import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const data = readFileSync(new URL('../src/chapter-data.ts', import.meta.url), 'utf8');
const source = `${page}\n${data}`;

test('13개 PDF에서 확인한 1~9장 범위와 검증된 핵심 수식을 제공한다', () => {
  assert.match(source, /13개 강의자료/);
  for (const title of ['가치평가 기초', '이익기준 접근법', '자본비용', '투자안 가치평가', '채권·주식 가치평가', '자산·시장가치 접근법', '기본적 분석', '재무비율 종합분석', '레버리지 분석']) {
    assert.match(source, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(source, /PV = FV \/ \(1 \+ r\)ⁿ/);
  assert.match(source, /DCL = DOL × DFL/);
  assert.match(source, /기호 정의와 문제 조건은 해당 장의 강의자료와 함께 확인/);
});

test('금융시장론형 장 탐색과 버전이 있는 진도 저장을 제공한다', () => {
  assert.match(page, /\?chapter=/);
  assert.match(page, /version: 1/);
  assert.match(page, /valuation-study-completed/);
  assert.match(page, /이 장의 구성/);
});
