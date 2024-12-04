// lib/vectorizer.ts
export const createVector = (tokens: string[]): number[] => {
  const vocabulary = Array.from(new Set(tokens));
  return vocabulary.map((token) => tokens.filter((t) => t === token).length);
};
