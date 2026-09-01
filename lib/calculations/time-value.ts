export type PresentValueInput = {
  futureValue: number;
  rate: number;
  periods: number;
};

export type PresentValueResult = PresentValueInput & {
  discountFactor: number;
  presentValue: number;
  roundedPresentValue: number;
};

const requireFinite = (value: number, label: string) => {
  if (!Number.isFinite(value)) throw new RangeError(`${label}은(는) 유한한 수여야 합니다.`);
};

export function calculatePresentValue(input: PresentValueInput): PresentValueResult {
  requireFinite(input.futureValue, '미래가치');
  requireFinite(input.rate, '할인율');
  requireFinite(input.periods, '기간');

  if (input.rate <= -1) throw new RangeError('할인율은 -100%보다 커야 합니다.');
  if (input.periods < 0) throw new RangeError('기간은 0 이상이어야 합니다.');

  const discountFactor = 1 / ((1 + input.rate) ** input.periods);
  const presentValue = input.futureValue * discountFactor;

  if (!Number.isFinite(discountFactor) || discountFactor === 0 || !Number.isFinite(presentValue)) {
    throw new RangeError('입력값의 범위가 너무 커 현재가치를 안정적으로 계산할 수 없습니다.');
  }

  return {
    ...input,
    discountFactor,
    presentValue,
    roundedPresentValue: Math.round(presentValue),
  };
}

export function buildPresentValueCurve(
  futureValue: number,
  periods: number,
  rates: readonly number[],
) {
  return rates.map((rate) => calculatePresentValue({ futureValue, periods, rate }));
}
