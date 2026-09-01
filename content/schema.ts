export const learningBlockTypes = [
  'chapter-intro',
  'concept',
  'comparison',
  'formula',
  'visual',
  'worked-example',
  'practice',
  'chapter-test',
  'recap',
  'source-note',
] as const;

export type LearningBlockType = (typeof learningBlockTypes)[number];

type BaseBlock<T extends LearningBlockType> = {
  id: string;
  type: T;
  title: string;
};

export type ChapterIntroBlock = BaseBlock<'chapter-intro'> & { body: string };

export type ConceptBlock = BaseBlock<'concept'> & {
  stage: 'intuition' | 'definition' | 'mechanism';
  paragraphs: string[];
  keyPoint?: string;
};

export type ComparisonBlock = BaseBlock<'comparison'> & {
  headers: string[];
  rows: string[][];
};

export type FormulaBlock = BaseBlock<'formula'> & {
  purpose: string;
  expression: string;
  readableExpression: string;
  symbols: { symbol: string; meaning: string; unit: string }[];
  conditions: string[];
  interpretation: string;
  commonMistakes: string[];
};

export type TimelineVisual = {
  kind: 'timeline';
  futureValue: number;
  rate: number;
  periods: number;
  points: { id: string; time: string; label: string; amount: number; unit: '원' }[];
  directionLabel: string;
};

export type ChartVisual = {
  kind: 'chart';
  futureValue: number;
  periods: number;
  xAxis: { label: string; unit: '%' };
  yAxis: { label: string; unit: '원' };
  points: { id: string; rate: number; ratePercent: number; presentValue: number }[];
};

export type VisualBlock = BaseBlock<'visual'> & {
  visual: TimelineVisual | ChartVisual;
  altText: string;
  condition: string;
  observation: string;
};

export type WorkedExampleBlock = BaseBlock<'worked-example'> & {
  badge: '강의자료 예제' | '강의자료 외 보충';
  given: { label: string; value: string }[];
  target: string;
  formulaChoice: string;
  substitution: string;
  calculation: {
    futureValue: number;
    rate: number;
    periods: number;
    discountFactor: number;
    presentValue: number;
  };
  answer: string;
  interpretation: string;
};

export type PracticeBlock = BaseBlock<'practice'> & { prompt: string; answer: string };
export type ChapterTestBlock = BaseBlock<'chapter-test'> & { prompt: string; answer: string };
export type RecapBlock = BaseBlock<'recap'> & { points: string[] };

export type SourceReference = {
  documentLabel: string;
  pages?: string;
  topic: string;
  kind: 'lecture' | 'supplement';
};

export type SourceNoteBlock = BaseBlock<'source-note'> & {
  references: SourceReference[];
};

export type LearningBlock =
  | ChapterIntroBlock
  | ConceptBlock
  | ComparisonBlock
  | FormulaBlock
  | VisualBlock
  | WorkedExampleBlock
  | PracticeBlock
  | ChapterTestBlock
  | RecapBlock
  | SourceNoteBlock;

export type LearningSection = {
  id: string;
  chapterId: string;
  title: string;
  searchText: string;
  blocks: LearningBlock[];
};
