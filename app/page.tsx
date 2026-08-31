'use client';

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Copy,
  Landmark,
  Menu,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Chapter = {
  id: string;
  number: string;
  title: string;
  label: string;
  summary: string;
  concepts: string[];
  formula?: string;
};

const chapters: Chapter[] = [
  {
    id: 'chapter-1', number: '01', title: '가치평가 기초', label: '판단의 프레임',
    summary: '평가 목적·대상·기준일을 정하고 기업과 산업을 분석한 뒤, DCF·상대가치·자산가치 중 방법을 선택합니다.',
    concepts: ['목적·대상·기준일', '기업·산업 분석', '방법 및 변수 선택', '민감도 분석과 보고'],
  },
  {
    id: 'chapter-2', number: '02', title: '이익기준 접근법', label: '시간가치와 현금흐름',
    summary: '서로 다른 시점의 돈을 현재가치로 맞추고, 세후 증분현금흐름만 골라 투자안의 실제 가치를 계산합니다.',
    concepts: ['현재가치·미래가치', '연금·영구연금', '증분현금흐름', '초기·영업·종료 현금흐름'],
    formula: 'PV = FV / (1 + r)ⁿ',
  },
  {
    id: 'chapter-3', number: '03', title: '자본비용', label: '할인율 설계',
    summary: '투자자가 요구하는 최소수익률을 부채·우선주·보통주 원천별로 구하고 시장가치 가중치로 WACC를 만듭니다.',
    concepts: ['세후 타인자본비용', '채권 YTM', 'CAPM과 보통주비용', '시장가치 가중 WACC'],
    formula: 'kₑ = Rf + β(E(Rm) − Rf)',
  },
  {
    id: 'chapter-4', number: '04', title: '투자안 가치평가', label: '채택과 기각',
    summary: 'NPV를 기준으로 부의 증가를 판단하고, IRR·회수기간·할인회수기간·회계적 수익률·PI의 장단점을 비교합니다.',
    concepts: ['NPV > 0', 'IRR과 요구수익률', '회수기간의 한계', 'NPV–IRR 충돌과 Fisher 수익률'],
    formula: 'NPV = Σ CFₜ / (1 + r)ᵗ − I₀',
  },
  {
    id: 'chapter-5', number: '05', title: '채권·주식 가치평가', label: '증권의 가격',
    summary: '채권의 현금흐름과 수익률 관계, 만기·표면이율에 따른 가격 민감도, 주식의 배당할인모형을 연결합니다.',
    concepts: ['채권가격–수익률 역관계', '만기·표면이율과 민감도', 'YTM·수익률곡선·신용등급', '무성장·고정성장 DDM'],
  },
  {
    id: 'chapter-6', number: '06', title: '자산·시장가치 접근법', label: '비교 가능한 가격',
    summary: '자산에서 부채를 뺀 순자산가치와, 유사기업의 배수를 이용하는 상대가치평가를 비교합니다.',
    concepts: ['장부가치·시장가치·청산가치', 'PER', 'PBR', 'PCR·PSR·Price/EBITDA'],
  },
  {
    id: 'chapter-7', number: '07', title: '기본적 분석', label: '경제→산업→기업',
    summary: '경제·산업·기업 요인이 미래 현금흐름과 할인율에 어떻게 영향을 주는지 톱다운과 보텀업 관점으로 분석합니다.',
    concepts: ['거시경제 변수와 주가', 'Porter 산업구조', '제품수명주기', '질적·양적 기업분석'],
  },
  {
    id: 'chapter-8', number: '08', title: '재무비율 종합분석', label: '흩어진 비율을 하나로',
    summary: '공통형·지수형 재무제표에서 출발해 ROI·ROE, 지수법과 시각적 종합평가의 구조와 한계를 살핍니다.',
    concepts: ['공통형·지수형 재무제표', 'DuPont ROI', 'ROE와 부채비율', '지수법·삼각평가·원형도표'],
    formula: 'ROI = 순이익률 × 총자산회전율',
  },
  {
    id: 'chapter-9', number: '09', title: '레버리지 분석', label: '고정비가 만드는 확대',
    summary: '고정영업비와 고정재무비가 매출 변화의 손익 효과를 어떻게 확대하는지 DOL·DFL·DCL로 측정합니다.',
    concepts: ['영업레버리지와 영업위험', '재무레버리지와 재무위험', '결합레버리지', '매출·EBIT 증가와 위험 감소'],
    formula: 'DCL = DOL × DFL',
  },
];

const quizItems = [
  { question: 'NPV와 IRR의 결론이 충돌할 때 강의자료가 우선하라고 설명한 기준은?', options: ['IRR', 'NPV', '회수기간'], answer: 1, note: 'NPV는 주주 부의 절대 증가액과 가치가산원칙을 직접 반영합니다.' },
  { question: '매몰원가는 투자안의 증분현금흐름에 포함할까?', options: ['포함한다', '포함하지 않는다', '세후에만 포함한다'], answer: 1, note: '이미 발생해 의사결정으로 바뀌지 않는 비용이므로 제외합니다.' },
  { question: '결합레버리지도 DCL의 올바른 관계는?', options: ['DOL + DFL', 'DOL × DFL', 'DOL ÷ DFL'], answer: 1, note: '매출→EBIT 확대와 EBIT→EPS 확대가 연속되므로 곱합니다.' },
];

const storageKey = 'valuation-study-completed';

export default function Home() {
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string' && chapters.some((chapter) => chapter.id === id)) : [];
    } catch { return []; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return chapters.filter((chapter) =>
      [chapter.title, chapter.label, chapter.summary, chapter.formula, ...chapter.concepts]
        .filter(Boolean).join(' ').toLowerCase().includes(term),
    );
  }, [query]);

  const toggleComplete = (id: string) => {
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* device-local storage may be unavailable */ }
  };

  const copyStudyOrder = async () => {
    try {
      await navigator.clipboard.writeText('가치평가 학습 순서: 1 기초 → 2 현금흐름 → 3 자본비용 → 4 투자안 → 5 증권 → 6 상대가치 → 7 기본적 분석 → 8 종합비율 → 9 레버리지');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="가치평가 학습실 처음으로">
          <span className="brand-mark">V</span><span>Valuation Desk</span>
        </a>
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="학습 내용 검색" placeholder="개념·수식 검색" />
          {query && <button className="icon-button" onClick={() => setQuery('')} aria-label="검색어 지우기"><X size={17} /></button>}
        </label>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label="목차 열기">
          {menuOpen ? <X /> : <Menu />}
        </button>
        {query && (
          <output className="search-results">
            <span>{results.length ? `${results.length}개 장에서 찾았습니다` : '일치하는 학습 내용이 없습니다'}</span>
            {results.map((chapter) => <a key={chapter.id} href={`#${chapter.id}`} onClick={() => setQuery('')}><b>{chapter.number}</b>{chapter.title}<ChevronRight size={16} /></a>)}
          </output>
        )}
      </header>

      <nav id="mobile-nav" className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-label="모바일 장별 목차">
        {chapters.map((chapter) => <a key={chapter.id} href={`#${chapter.id}`} onClick={() => setMenuOpen(false)}><b>{chapter.number}</b>{chapter.title}</a>)}
      </nav>

      <section id="top" className="hero">
        <div>
          <p className="eyebrow">INHA · VALUE LAB</p>
          <h1>숫자를 외우기 전에,<br />가치가 만들어지는 흐름부터.</h1>
          <p className="hero-copy">13개 강의자료, 1장부터 9장까지. 현금흐름에서 자본비용·투자안·증권가치·기본적 분석과 레버리지까지 하나의 판단 체계로 연결합니다.</p>
          <div className="hero-actions">
            <a className="primary-action" href="#chapter-map">학습 지도 열기 <ArrowRight size={18} /></a>
            <button className="secondary-action" onClick={copyStudyOrder}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? '복사됨' : '학습 순서 복사'}</button>
          </div>
        </div>
        <aside className="focus-card" aria-label="오늘의 학습 초점">
          <span className="card-kicker">TODAY&apos;S FOCUS</span><Calculator size={28} aria-hidden="true" />
          <h2>현재가치의 언어</h2><code>PV = FV / (1 + r)ⁿ</code>
          <p>미래 현금흐름을 같은 시점의 숫자로 바꾸는 가치평가의 출발점</p>
        </aside>
      </section>

      <div className="study-layout">
        <aside className="chapter-rail" aria-label="장별 빠른 이동">
          <div className="progress-panel">
            <span>MY PROGRESS</span><strong>{completed.length} / 9</strong>
            <div className="progress-track" aria-label={`진도 ${completed.length}장 완료`}><i style={{ width: `${(completed.length / 9) * 100}%` }} /></div>
          </div>
          {chapters.map((chapter) => <a key={chapter.id} className={completed.includes(chapter.id) ? 'done' : ''} href={`#${chapter.id}`}><b>{chapter.number}</b><span>{chapter.title}</span>{completed.includes(chapter.id) && <CheckCircle2 size={15} />}</a>)}
        </aside>

        <div className="content-column">
          <section id="chapter-map" className="content-section map-section">
            <div className="section-heading"><BookOpen size={22} /><div><span>LEARNING MAP</span><h2>9개 장을 세 덩어리로</h2></div></div>
            <div className="phase-grid">
              <article><b>01</b><span>VALUE FOUNDATION</span><h3>가치를 계산할 준비</h3><p>1 기초 → 2 현금흐름 → 3 자본비용</p></article>
              <article><b>02</b><span>VALUATION ENGINE</span><h3>의사결정에 적용</h3><p>4 투자안 → 5 증권 → 6 상대가치</p></article>
              <article><b>03</b><span>BUSINESS DIAGNOSIS</span><h3>기업 전체를 해석</h3><p>7 기본적 분석 → 8 종합비율 → 9 레버리지</p></article>
            </div>
            <div className="decision-flow" aria-label="가치평가 의사결정 흐름">
              <span><Target /> 미래 현금흐름</span><b>+</b><span><ShieldCheck /> 위험에 맞는 할인율</span><b>→</b><span><CircleDollarSign /> 현재가치</span><b>→</b><span><TrendingUp /> 의사결정</span>
            </div>
          </section>

          <section className="content-section chapters-section">
            <div className="section-heading"><Landmark size={22} /><div><span>CHAPTER NOTES</span><h2>장별 핵심 노트</h2></div></div>
            <div className="chapter-list">
              {chapters.map((chapter) => (
                <article id={chapter.id} className="chapter-card" key={chapter.id}>
                  <div className="chapter-number">{chapter.number}</div>
                  <div className="chapter-body">
                    <span className="chapter-label">{chapter.label}</span><h3>{chapter.title}</h3><p>{chapter.summary}</p>
                    <ul>{chapter.concepts.map((concept) => <li key={concept}>{concept}</li>)}</ul>
                    {chapter.formula && <code>{chapter.formula}</code>}
                  </div>
                  <button className={`complete-button ${completed.includes(chapter.id) ? 'is-complete' : ''}`} onClick={() => toggleComplete(chapter.id)} aria-pressed={completed.includes(chapter.id)}>
                    {completed.includes(chapter.id) ? <CheckCircle2 size={18} /> : <span className="empty-check" />}{completed.includes(chapter.id) ? '완료' : '학습 완료'}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="content-section formula-section">
            <div className="section-heading"><Calculator size={22} /><div><span>FORMULA DESK</span><h2>수식은 의미와 함께</h2></div></div>
            <div className="formula-grid">
              <article><span>영업현금흐름</span><code>ΔOCF = (ΔS − ΔC)(1 − t) + tΔD</code><p>매출·현금비용의 세후 효과에 감가상각비의 절세효과를 더합니다.</p></article>
              <article><span>자기자본비용</span><code>kₑ = Rf + β(E(Rm) − Rf)</code><p>무위험수익률에 체계적 위험에 대한 시장위험 프리미엄을 더합니다.</p></article>
              <article><span>ROI 분해</span><code>ROI = 순이익률 × 총자산회전율</code><p>낮은 수익성이 마진 때문인지 자산 활용 때문인지 나눠 봅니다.</p></article>
              <article><span>결합레버리지</span><code>DCL = DOL × DFL</code><p>매출 변화가 EBIT와 EPS를 거치며 확대되는 전체 효과입니다.</p></article>
            </div>
            <p className="source-note">수식 표기는 강의자료에서 명확히 확인된 형태만 요약했습니다. 기호 정의와 문제 조건은 해당 장의 원문을 함께 확인하세요.</p>
          </section>

          <section className="content-section caution-section">
            <div><span>DECISION RULE</span><h2>시험에서 자주 섞이는 구분</h2></div>
            <div className="rule-grid">
              <article><b>포함</b><h3>증분현금흐름</h3><p>잠식효과, 기회비용, 운전자본 증감, 처분 관련 세금</p></article>
              <article><b>제외</b><h3>현금흐름이 아닌 것</h3><p>매몰원가, 감가상각비 자체, 자금조달비용의 중복 반영</p></article>
              <article><b>우선</b><h3>NPV 판단</h3><p>NPV와 IRR이 충돌하면 가치 증가액을 직접 나타내는 NPV</p></article>
            </div>
          </section>

          <section className="content-section quiz-section">
            <div className="section-heading"><BarChart3 size={22} /><div><span>QUICK CHECK</span><h2>3문제로 연결 확인</h2></div></div>
            <div className="quiz-list">
              {quizItems.map((item, index) => (
                <article key={item.question}>
                  <span>Q{index + 1}</span><h3>{item.question}</h3>
                  <div className="option-row">
                    {item.options.map((option, optionIndex) => <button key={option} onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))} className={answers[index] === optionIndex ? (optionIndex === item.answer ? 'correct' : 'wrong') : ''}>{option}</button>)}
                  </div>
                  {answers[index] !== undefined && <p className={answers[index] === item.answer ? 'answer-note correct-note' : 'answer-note'}>{answers[index] === item.answer ? '정답. ' : '다시 생각해보세요. '}{item.note}</p>}
                </article>
              ))}
            </div>
          </section>

          <footer><strong>VALUATION DESK</strong><p>가치평가 강의자료 13개 PDF · Chapter 1–9 기준 정리</p><div className="footer-links"><a href="https://hyunchanwi.github.io/study-hub/">← 전체 과목</a><a href="#top">맨 위로 ↑</a></div></footer>
        </div>
      </div>
    </main>
  );
}
