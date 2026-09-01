'use client';

import { useEffect } from 'react';
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowLeft,
  BookOpenCheck,
  Calculator,
  ChartNoAxesCombined,
  CircleDollarSign,
  Library,
  Lightbulb,
  Search,
  Sigma,
  TriangleAlert,
} from 'lucide-react';
import type {
  ConceptBlock,
  FormulaBlock,
  LearningBlock,
  LearningSection,
  SourceNoteBlock,
  VisualBlock,
  WorkedExampleBlock,
} from '../../content/schema';

const won = (value: number, rounded = true) => `${(rounded ? Math.round(value) : value).toLocaleString('ko-KR')}원`;
const compactWon = (value: number) => `${Math.round(value / 10_000).toLocaleString('ko-KR')}만`;

const stageLabels: Record<ConceptBlock['stage'], string> = {
  intuition: '직관',
  definition: '정확한 정의',
  mechanism: '작동 원리',
};

function ConceptCard({ block }: { block: ConceptBlock }) {
  const isTrap = block.id === 'pv-exam-trap';
  return (
    <section className={`pv-block pv-concept ${isTrap ? 'pv-trap' : ''}`} id={block.id}>
      <div className="pv-block-label">
        {isTrap ? <TriangleAlert aria-hidden="true" /> : <Lightbulb aria-hidden="true" />}
        {isTrap ? '시험 함정' : stageLabels[block.stage]}
      </div>
      <h3>{block.title}</h3>
      {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {block.keyPoint && <p className="pv-key-point"><strong>한 줄 핵심</strong>{block.keyPoint}</p>}
    </section>
  );
}

function FormulaCard({ block }: { block: FormulaBlock }) {
  return (
    <section className="pv-block pv-formula" id={block.id}>
      <div className="pv-block-label"><Sigma aria-hidden="true" /> 공식 이해</div>
      <h3>{block.title}</h3>
      <p>{block.purpose}</p>
      <div className="pv-expression" aria-label={block.readableExpression}>{block.expression}</div>
      <p className="pv-readable-formula"><strong>말로 읽기</strong>{block.readableExpression}</p>
      <dl className="pv-symbols">
        {block.symbols.map((symbol) => (
          <div key={symbol.symbol}>
            <dt>{symbol.symbol}</dt>
            <dd><strong>{symbol.meaning}</strong><span>단위: {symbol.unit}</span></dd>
          </div>
        ))}
      </dl>
      <div className="pv-two-column">
        <div><h4>성립 조건</h4><ul>{block.conditions.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h4>대표 오용</h4><ul>{block.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
      <p className="pv-formula-meaning"><strong>재무적 의미</strong>{block.interpretation}</p>
    </section>
  );
}

function Timeline({ block }: { block: VisualBlock & { visual: { kind: 'timeline' } } }) {
  if (block.visual.points.length !== 2) {
    return <p className="pv-render-error" role="alert">현금흐름선 데이터 형식을 확인해주세요.</p>;
  }
  const [present, future] = block.visual.points;
  return (
    <figure className="pv-block pv-visual" id={block.id} aria-labelledby={`${block.id}-title`} aria-describedby={`${block.id}-description`}>
      <div className="pv-block-label"><CircleDollarSign aria-hidden="true" /> 현금흐름선</div>
      <h3 id={`${block.id}-title`}>{block.title}</h3>
      <p className="pv-visual-condition"><strong>조건</strong>{block.condition}</p>
      <div className="pv-timeline" aria-hidden="true">
        <div className="pv-time-point">
          <span>{present.time}</span><strong>{present.label}</strong><b>{won(present.amount)}</b>
        </div>
        <div className="pv-time-connector">
          <ArrowLeft aria-hidden="true" />
          <span>{block.visual.directionLabel}</span>
        </div>
        <div className="pv-time-point future">
          <span>{future.time}</span><strong>{future.label}</strong><b>{won(future.amount)}</b>
        </div>
      </div>
      <figcaption id={`${block.id}-description`}>
        <span className="pv-alt-text">{block.altText}</span>
        <strong>여기서 볼 것</strong>{block.observation}
      </figcaption>
    </figure>
  );
}

function RateChart({ block }: { block: VisualBlock & { visual: { kind: 'chart' } } }) {
  const chartData = block.visual.points.map((point) => ({
    ...point,
    label: won(point.presentValue),
  }));

  return (
    <figure className="pv-block pv-visual" id={block.id} aria-labelledby={`${block.id}-title`} aria-describedby={`${block.id}-description`}>
      <div className="pv-block-label"><ChartNoAxesCombined aria-hidden="true" /> 관계 그래프</div>
      <h3 id={`${block.id}-title`}>{block.title}</h3>
      <p className="pv-visual-condition"><strong>조건</strong>{block.condition}</p>
      <div className="pv-chart" aria-hidden="true">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 34, right: 24, bottom: 28, left: 14 }} accessibilityLayer>
            <CartesianGrid strokeDasharray="4 4" stroke="#dfe5df" />
            <XAxis
              dataKey="ratePercent"
              tickFormatter={(value) => `${value}%`}
              label={{ value: `${block.visual.xAxis.label} (${block.visual.xAxis.unit})`, position: 'insideBottom', offset: -16 }}
            />
            <YAxis
              domain={['dataMin - 50000', 'dataMax + 50000']}
              tickFormatter={compactWon}
              label={{ value: `${block.visual.yAxis.label} (${block.visual.yAxis.unit})`, angle: -90, position: 'insideLeft', offset: 4 }}
              width={64}
            />
            <Tooltip formatter={(value) => [won(Number(value), false), '현재가치']} labelFormatter={(value) => `할인율 ${value}%`} />
            <Line type="monotone" dataKey="presentValue" stroke="#275d4b" strokeWidth={3} dot={{ r: 5, fill: '#fff', strokeWidth: 3 }} activeDot={{ r: 7 }}>
              <LabelList dataKey="presentValue" position="top" formatter={(value) => compactWon(Number(value))} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="pv-chart-table-wrap">
        <table className="pv-chart-table">
          <caption>그래프와 동일한 현재가치 데이터</caption>
          <thead><tr><th scope="col">연 할인율</th><th scope="col">현재가치</th></tr></thead>
          <tbody>{block.visual.points.map((point) => (
            <tr key={point.id}><th scope="row">{point.ratePercent}%</th><td>{won(point.presentValue)}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <figcaption id={`${block.id}-description`}>
        <span className="pv-alt-text">{block.altText}</span>
        <strong>여기서 볼 것</strong>{block.observation}
      </figcaption>
    </figure>
  );
}

function VisualCard({ block }: { block: VisualBlock }) {
  return block.visual.kind === 'timeline'
    ? <Timeline block={block as VisualBlock & { visual: { kind: 'timeline' } }} />
    : <RateChart block={block as VisualBlock & { visual: { kind: 'chart' } }} />;
}

function WorkedExample({ block }: { block: WorkedExampleBlock }) {
  const calculation = block.calculation;
  const compoundBase = 1 + calculation.rate;
  return (
    <section className="pv-block pv-example" id={block.id}>
      <div className="pv-block-label"><Calculator aria-hidden="true" /> 단계별 풀이 예제</div>
      <div className="pv-example-title"><h3>{block.title}</h3><span>{block.badge}</span></div>
      <ol className="pv-solution-steps">
        <li><strong>주어진 정보</strong><dl>{block.given.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></li>
        <li><strong>구할 값</strong><p>{block.target}</p></li>
        <li><strong>공식 선택</strong><p>{block.formulaChoice}</p></li>
        <li><strong>수치 대입</strong><p className="pv-step-formula">{block.substitution}</p></li>
        <li><strong>중간 계산</strong><p>할인계수 = 1 / {compoundBase.toFixed(2)}^{calculation.periods} = {calculation.discountFactor.toFixed(6)}</p><p>PV = {calculation.futureValue.toLocaleString('ko-KR')} × {calculation.discountFactor.toFixed(6)} = {calculation.presentValue.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원</p></li>
        <li className="pv-answer"><strong>정답</strong><p>{block.answer}</p></li>
      </ol>
      <p className="pv-interpretation"><strong>해석</strong>{block.interpretation}</p>
    </section>
  );
}

function SourceNote({ block }: { block: SourceNoteBlock }) {
  return (
    <section className="pv-block pv-source" id={block.id}>
      <div className="pv-block-label"><Library aria-hidden="true" /> 출처</div>
      <h3>{block.title}</h3>
      <ul>{block.references.map((reference) => (
        <li key={`${reference.documentLabel}-${reference.topic}`}>
          <span>{reference.kind === 'lecture' ? '강의자료' : '강의자료 외 보충'}</span>
          <strong>{reference.documentLabel}{reference.pages ? ` · ${reference.pages}` : ''}</strong>
          <p>{reference.topic}</p>
        </li>
      ))}</ul>
    </section>
  );
}

function LearningBlockRenderer({ block }: { block: LearningBlock }) {
  switch (block.type) {
    case 'concept': return <ConceptCard block={block} />;
    case 'formula': return <FormulaCard block={block} />;
    case 'visual': return <VisualCard block={block} />;
    case 'worked-example': return <WorkedExample block={block} />;
    case 'source-note': return <SourceNote block={block} />;
    case 'chapter-intro': return <section className="pv-block" id={block.id}><h3>{block.title}</h3><p>{block.body}</p></section>;
    case 'comparison': return (
      <section className="pv-block" id={block.id}>
        <h3>{block.title}</h3>
        <div className="pv-generic-table-wrap"><table className="pv-generic-table">
          <thead><tr>{block.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
          <tbody>{block.rows.map((row, rowIndex) => <tr key={`${block.id}-${rowIndex}`}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={`${cell}-${cellIndex}`}>{cell}</th> : <td key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
        </table></div>
      </section>
    );
    case 'practice':
    case 'chapter-test': return <section className="pv-block" id={block.id}><h3>{block.title}</h3><p>{block.prompt}</p><details><summary>정답 확인</summary><p>{block.answer}</p></details></section>;
    case 'recap': return <section className="pv-block" id={block.id}><h3>{block.title}</h3><ul>{block.points.map((point) => <li key={point}>{point}</li>)}</ul></section>;
  }
}

type PresentValueSearchJump = {
  query: string;
  sectionLabel: string;
  snippet: string;
};

export function PresentValueLesson({
  section,
  searchJump,
}: {
  section: LearningSection;
  searchJump: PresentValueSearchJump | null;
}) {
  useEffect(() => {
    if (window.location.hash !== `#${section.id}`) return;
    window.requestAnimationFrame(() => document.getElementById(section.id)?.focus({ preventScroll: true }));
  }, [section.id]);

  return (
    <section className={`present-value-lesson ${searchJump ? 'search-highlight' : ''}`} aria-labelledby={section.id}>
      <header className="pv-section-header">
        {searchJump && (
          <div className="search-location-note">
            <Search size={16} aria-hidden="true" />
            <span><strong><mark>{searchJump.query}</mark> 검색 위치</strong>{searchJump.sectionLabel} · {searchJump.snippet}</span>
          </div>
        )}
        <div className="section-kicker"><BookOpenCheck aria-hidden="true" /> 상세 학습 절</div>
        <h2 id={section.id} tabIndex={-1}>{section.title}</h2>
        <p>강의자료의 현재가치 개념을 계산과 시각자료까지 연결해, 이 절만으로 설명하고 풀 수 있도록 구성했습니다.</p>
      </header>
      {section.blocks.map((block) => <LearningBlockRenderer block={block} key={block.id} />)}
    </section>
  );
}
