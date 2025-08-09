export interface BiasDimension {
  score: number;
  label: string;
  confidence: number; // 0-1
  highlightedPhrases: string[];
  reasoning: string;
  confidenceInterval?: {
    lower: number;
    upper: number;
    width: number;
  };
}

export interface BiasScores {
  ideologicalStance: BiasDimension;
  factualGrounding: BiasDimension;
  framingChoices: BiasDimension;
  emotionalTone: BiasDimension;
  sourceTransparency: BiasDimension;
  overallBiasLevel: number;
  primarySources: string[];
  analyzedAt: string;
  analysisStatus?: 'ai' | 'fallback-api' | 'fallback-parse' | 'fallback-empty';
  isFallback?: boolean;
}

export interface Article {
  id: string;
  headline: string;
  content: string;
  description?: string;
  source: string;
  author?: string;
  publishedAt: string;
  url: string;
  urlToImage?: string;
  biasScores: BiasScores | null;
  narrativeCluster?: string | null;
  primarySources?: string[];
}

export interface NarrativeCluster {
  id: string;
  topic: string;
  framingType: string;
  title: string;
  articles: Article[];
  representativeArticle: Article | null;
  biasDistribution: { left: number; center: number; right: number };
  avgScores: {
    ideologicalStance: number;
    factualGrounding: number;
    framingChoices: number;
    emotionalTone: number;
    sourceTransparency: number;
  };
  commonPhrases: Record<string, number>;
  sourceCount: Record<string, number>;
  timeSpan: { earliest: string | null; latest: string | null };
  // Optional extended analysis fields (present in /narratives/{id})
  sourceAnalysis?: Record<string, {
    articleCount: number;
    avgBiasScores: Record<string, number>;
    distinctivePhrases?: string[];
  }>;
  framingEvolution?: Array<{
    timestamp: string;
    source: string;
    headline: string;
    keyFramingShift?: string;
    biasSnapshot?: { ideological?: number; emotional?: number };
  }>;
}

export type BiasDimensionKey = keyof Pick<BiasScores,
  'ideologicalStance' | 'factualGrounding' | 'framingChoices' | 'emotionalTone' | 'sourceTransparency'
>;

export const DIMENSION_KEYS: BiasDimensionKey[] = [
  'ideologicalStance',
  'factualGrounding',
  'framingChoices',
  'emotionalTone',
  'sourceTransparency'
];

export const DIMENSION_LABELS: Record<BiasDimensionKey, string> = {
  ideologicalStance: 'Ideological',
  factualGrounding: 'Factual',
  framingChoices: 'Framing',
  emotionalTone: 'Emotional',
  sourceTransparency: 'Transparency'
};

export const DIMENSION_COLORS: Record<BiasDimensionKey, string> = {
  ideologicalStance: 'bias-ideological',
  factualGrounding: 'bias-factual',
  framingChoices: 'bias-framing',
  emotionalTone: 'bias-emotional',
  sourceTransparency: 'bias-transparency'
};
