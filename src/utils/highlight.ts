import type { BiasScores } from '../types';

export interface HighlightSpan {
  text: string;
  dimensions: string[]; // dimension keys
}

export function buildHighlights(content: string, scores: BiasScores): HighlightSpan[] {
  const phraseMap: Record<string, Set<string>> = {};
  Object.entries(scores).forEach(([key, val]) => {
    if (typeof val === 'object' && val && 'highlightedPhrases' in val) {
      (val.highlightedPhrases as string[]).forEach(p => {
        const norm = p.trim();
        if (!norm) return;
        (phraseMap[norm] ||= new Set()).add(key);
      });
    }
  });
  if (!Object.keys(phraseMap).length) return [{ text: content, dimensions: [] }];
  const escaped = Object.keys(phraseMap).sort((a,b) => b.length - a.length).map(p => p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const spans: HighlightSpan[] = [];
  let lastIndex = 0; let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    if (m.index > lastIndex) spans.push({ text: content.slice(lastIndex, m.index), dimensions: [] });
    const phrase = m[0];
    const dims = phraseMap[Object.keys(phraseMap).find(k => k.toLowerCase() === phrase.toLowerCase()) || ''];
    spans.push({ text: phrase, dimensions: dims ? Array.from(dims) : [] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) spans.push({ text: content.slice(lastIndex), dimensions: [] });
  return spans;
}
