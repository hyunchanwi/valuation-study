import type { LearningSection } from '../schema.ts';
import { buildPresentValueCurve, calculatePresentValue } from '../../lib/calculations/time-value.ts';

const example = calculatePresentValue({ futureValue: 1_000_000, rate: 0.1, periods: 2 });
const curve = buildPresentValueCurve(1_000_000, 2, [0, 0.05, 0.1, 0.15, 0.2]);

export const presentValueSection: LearningSection = {
  id: 'present-value',
  chapterId: 'chapter-2',
  title: '현재가치: 미래의 돈을 오늘의 기준으로 읽기',
  searchText: [
    '현재가치 PV 미래가치 FV 할인율 r 기간 n 화폐의 시간가치 할인계수',
    '백만원 100만원 10% 2년 826446원 현금흐름 타임라인 할인율 그래프',
  ].join(' '),
  blocks: [
    {
      id: 'pv-intuition',
      type: 'concept',
      stage: 'intuition',
      title: '왜 2년 뒤 100만 원은 오늘 100만 원보다 작을까?',
      paragraphs: [
        '오늘 받은 돈은 바로 예금하거나 투자해 수익을 만들 수 있지만, 미래에 받을 돈은 그 기회를 기다려야 합니다. 따라서 시점이 다른 금액을 그대로 비교하면 안 됩니다.',
        '현재가치는 미래 금액을 오늘의 동일한 출발선으로 옮긴 값입니다. 미래에서 현재로 이동할 때는 그동안 얻을 수 있었던 수익을 거꾸로 제거하며, 이 과정을 할인이라고 합니다.',
      ],
      keyPoint: '현재가치는 미래 금액의 크기뿐 아니라 언제 받는지와 어떤 수익률을 포기하는지를 함께 반영합니다.',
    },
    {
      id: 'pv-definition',
      type: 'concept',
      stage: 'definition',
      title: '현재가치의 정확한 정의',
      paragraphs: [
        '현재가치(Present Value, PV)는 미래의 특정 시점에 받을 현금흐름과 경제적으로 동등한 오늘의 금액입니다.',
        '여기서 동등하다는 말은 오늘의 현재가치를 할인율만큼 복리 운용하면 미래가치와 같아진다는 뜻입니다. 현재가치는 단순히 미래 금액에서 이자를 빼는 계산이 아니라, 복리의 역산입니다.',
      ],
    },
    {
      id: 'pv-mechanism',
      type: 'concept',
      stage: 'mechanism',
      title: '복리를 한 기간씩 거꾸로 되돌린다',
      paragraphs: [
        '오늘의 1원은 한 기간 뒤 (1+r)원, n기간 뒤에는 (1+r)ⁿ원이 됩니다. 반대로 n기간 뒤의 1원을 오늘로 옮기려면 (1+r)ⁿ으로 나눕니다.',
        '할인율이 높을수록 포기하는 투자기회가 커져 현재가치는 작아집니다. 받는 시점이 멀수록 나누는 기간이 늘어나므로 현재가치는 더 작아집니다.',
      ],
      keyPoint: '미래가치 계산은 곱하기, 현재가치 계산은 같은 복리계수로 나누기입니다.',
    },
    {
      id: 'pv-formula',
      type: 'formula',
      title: '단일 미래금액의 현재가치 공식',
      purpose: 'n기간 뒤 한 번 받는 미래금액을 오늘의 금액으로 환산합니다.',
      expression: 'PV = FV / (1 + r)ⁿ',
      readableExpression: '현재가치는 미래가치를 1 더하기 할인율의 n제곱으로 나눈 값',
      symbols: [
        { symbol: 'PV', meaning: '현재시점의 경제적 가치', unit: '원' },
        { symbol: 'FV', meaning: 'n기간 뒤 받을 미래금액', unit: '원' },
        { symbol: 'r', meaning: '한 기간당 할인율', unit: '% 또는 소수' },
        { symbol: 'n', meaning: '할인하는 기간의 수', unit: '년·월 등 r과 같은 주기' },
      ],
      conditions: [
        'FV는 n기간 뒤 한 시점에 발생하는 금액이어야 합니다.',
        'r과 n의 단위를 맞춥니다. 연 할인율이면 n도 연수로 둡니다.',
        '위험이 다른 현금흐름에는 그 위험에 맞는 할인율을 사용합니다.',
      ],
      interpretation: '1/(1+r)ⁿ은 미래 1원이 오늘 몇 원인지를 나타내는 할인계수입니다.',
      commonMistakes: [
        '10%를 10으로 대입하지 말고 0.10으로 바꿉니다.',
        '2년치 단리이자 20%를 한 번에 빼지 않습니다. 현재가치는 복리의 역산입니다.',
        '월 할인율과 연 단위 기간을 섞지 않습니다.',
      ],
    },
    {
      id: 'pv-timeline',
      type: 'visual',
      title: '100만 원을 2년 전으로 할인하는 현금흐름선',
      visual: {
        kind: 'timeline',
        futureValue: example.futureValue,
        rate: example.rate,
        periods: example.periods,
        points: [
          { id: 'pv-t0', time: 't=0', label: '현재가치', amount: example.roundedPresentValue, unit: '원' },
          { id: 'pv-t2', time: 't=2', label: '미래가치', amount: 1_000_000, unit: '원' },
        ],
        directionLabel: '미래에서 현재로: 2기간 동안 10%씩 할인',
      },
      altText: 't=2의 미래가치 1,000,000원을 연 10%로 두 기간 할인하면 t=0 현재가치가 약 826,446원이 되는 왼쪽 방향의 현금흐름선.',
      condition: '미래가치 1,000,000원, 연 할인율 10%, 기간 2년',
      observation: '시간축의 금액을 비교하려면 먼저 같은 시점으로 옮겨야 합니다.',
    },
    {
      id: 'pv-rate-chart',
      type: 'visual',
      title: '할인율이 높아질수록 현재가치는 낮아진다',
      visual: {
        kind: 'chart',
        futureValue: 1_000_000,
        periods: 2,
        xAxis: { label: '연 할인율', unit: '%' },
        yAxis: { label: '현재가치', unit: '원' },
        points: curve.map((point) => ({
          id: `pv-rate-${Math.round(point.rate * 100)}`,
          rate: point.rate,
          ratePercent: point.rate * 100,
          presentValue: point.presentValue,
        })),
      },
      altText: '2년 뒤 1,000,000원의 현재가치가 할인율 0%에서 1,000,000원, 10%에서 약 826,446원, 20%에서 약 694,444원으로 낮아지는 우하향 곡선.',
      condition: '미래가치 1,000,000원과 기간 2년을 고정하고 연 할인율만 0%에서 20%까지 변화',
      observation: '같은 미래금액이라도 요구수익률 또는 위험이 커지면 오늘 지불할 수 있는 금액은 작아집니다.',
    },
    {
      id: 'pv-worked-example',
      type: 'worked-example',
      title: '2년 뒤 100만 원의 현재가치',
      badge: '강의자료 외 보충',
      given: [
        { label: '미래가치(FV)', value: '1,000,000원' },
        { label: '연 할인율(r)', value: '10% = 0.10' },
        { label: '기간(n)', value: '2년' },
      ],
      target: '오늘 시점의 현재가치(PV)',
      formulaChoice: '한 번 받는 미래금액이므로 PV = FV / (1+r)ⁿ을 사용합니다.',
      substitution: 'PV = 1,000,000 / (1+0.10)²',
      calculation: {
        futureValue: example.futureValue,
        rate: example.rate,
        periods: example.periods,
        discountFactor: example.discountFactor,
        presentValue: example.presentValue,
      },
      answer: `약 ${example.roundedPresentValue.toLocaleString('ko-KR')}원`,
      interpretation: '오늘 약 826,446원을 연 10%로 2년간 복리 운용하면 2년 뒤 1,000,000원과 경제적으로 같아집니다.',
    },
    {
      id: 'pv-exam-trap',
      type: 'concept',
      stage: 'mechanism',
      title: '시험 함정: 100만 원에서 20%를 빼면 될까?',
      paragraphs: [
        '틀립니다. 2년 동안 매년 10%를 적용하는 것은 총 20%를 한 번 빼는 단리 계산이 아닙니다. 1.10²=1.21이라는 복리계수를 거꾸로 나눠야 합니다.',
        '또한 할인율이 연 10%인지 월 10%인지 확인해야 합니다. 할인율의 한 기간과 n의 한 기간은 반드시 같아야 합니다.',
      ],
      keyPoint: '정답을 계산하기 전, 할인율의 주기와 현금흐름 시점을 먼저 표시하세요.',
    },
    {
      id: 'pv-source',
      type: 'source-note',
      title: '근거와 보충 범위',
      references: [
        {
          documentLabel: '강의2장(이익기준접근법)1',
          pages: '2–11쪽',
          topic: '화폐의 시간가치, 현재가치의 의미와 공식',
          kind: 'lecture',
        },
        {
          documentLabel: '학습용 보충 예제',
          topic: '1,000,000원·10%·2년 계산, 현금흐름선과 할인율 민감도',
          kind: 'supplement',
        },
      ],
    },
  ],
};
