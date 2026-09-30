import type { EditingPattern, PatternCategory } from "../schema/pattern.js";

export const searchableFields = ["id", "title", "purpose", "category"] as const;

export type SearchableField = (typeof searchableFields)[number];

export interface PatternSearchQuery {
  intent: string;
  category?: PatternCategory;
  limit?: number;
}

export interface PatternSearchResult {
  id: string;
  title: string;
  category: PatternCategory;
  purpose: string[];
  score: number;
  matchedFields: SearchableField[];
}

export const searchV2PositiveFields = ["id", "title", "purpose", "goodFor", "tags", "category"] as const;

export type SearchV2PositiveField = (typeof searchV2PositiveFields)[number];

export interface PatternSearchResultV2 {
  id: string;
  title: string;
  category: PatternCategory;
  purpose: string[];
  score: number;
  positiveScore: number;
  avoidWhenConflicts: string[];
  matchedPositiveFields: SearchV2PositiveField[];
}

const defaultLimit = 5;

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}\s]+/gu, "")
    .trim();
}

function characterBigrams(value: string): Set<string> {
  const characters = Array.from(value);
  return new Set(characters.slice(0, -1).map((character, index) => `${character}${characters[index + 1]}`));
}

function overlapScore(query: string, candidate: string): number {
  if (query.length === 0 || candidate.length === 0) return 0;

  const queryBigrams = characterBigrams(query);
  const candidateBigrams = characterBigrams(candidate);
  const commonBigrams = [...queryBigrams].filter((bigram) => candidateBigrams.has(bigram)).length;
  if (queryBigrams.size > 0 && commonBigrams === 0) return 0;
  const bigramCoverage = queryBigrams.size === 0 ? 0 : commonBigrams / queryBigrams.size;

  const queryCharacters = new Set(Array.from(query));
  const candidateCharacters = new Set(Array.from(candidate));
  const commonCharacters = [...queryCharacters].filter((character) => candidateCharacters.has(character)).length;
  const characterCoverage = commonCharacters / queryCharacters.size;

  return (bigramCoverage * 100) + (characterCoverage * 20);
}

function fieldScore(query: string, value: string, field: SearchableField): number {
  const normalizedValue = normalize(value);
  if (query === normalizedValue) {
    return field === "id" ? 1_000 : field === "title" ? 900 : field === "purpose" ? 800 : 700;
  }
  if (normalizedValue.includes(query)) return field === "title" ? 500 : 400;
  if (query.includes(normalizedValue) && normalizedValue.length > 1) return field === "title" ? 450 : 350;
  const overlap = overlapScore(query, normalizedValue);
  return field === "title" ? overlap * 1.2 : overlap;
}

function fieldsFor(pattern: EditingPattern): Record<SearchableField, string> {
  return {
    id: pattern.id,
    title: pattern.title,
    purpose: pattern.purpose.join(" "),
    category: pattern.category,
  };
}

function bestFieldScore(query: string, values: readonly string[], field: SearchableField): number {
  return values.reduce((best, value) => Math.max(best, fieldScore(query, value, field)), 0);
}

function longestCommonSubstringLength(left: string, right: string): number {
  let previous = Array(right.length + 1).fill(0);
  let longest = 0;

  for (const leftCharacter of left) {
    const current = Array(right.length + 1).fill(0);
    for (let index = 0; index < right.length; index += 1) {
      if (leftCharacter === right[index]) {
        current[index + 1] = previous[index] + 1;
        longest = Math.max(longest, current[index + 1]);
      }
    }
    previous = current;
  }

  return longest;
}

function hasStrongAvoidWhenConflict(query: string, avoidWhen: string): boolean {
  const normalizedAvoidWhen = normalize(avoidWhen);
  if (query === normalizedAvoidWhen) return true;
  if (query.length >= 5 && (normalizedAvoidWhen.includes(query) || query.includes(normalizedAvoidWhen))) return true;

  const requiredLength = Math.max(5, Math.ceil(Math.min(query.length, normalizedAvoidWhen.length) * 0.6));
  return longestCommonSubstringLength(query, normalizedAvoidWhen) >= requiredLength;
}

function avoidWhenConflicts(query: string, pattern: EditingPattern): string[] {
  return pattern.avoidWhen.filter((entry) => hasStrongAvoidWhenConflict(query, entry));
}

/**
 * Ranks lexical matches only. A higher score means a closer text match, not a
 * better editing decision.
 */
export function searchPatterns(patterns: readonly EditingPattern[], query: PatternSearchQuery): PatternSearchResult[] {
  const normalizedIntent = normalize(query.intent);
  if (normalizedIntent.length === 0) return [];

  const limit = query.limit ?? defaultLimit;
  if (!Number.isInteger(limit) || limit < 1) throw new Error("Search limit must be a positive integer.");

  return patterns
    .filter((pattern) => query.category === undefined || pattern.category === query.category)
    .map((pattern) => {
      const fields = fieldsFor(pattern);
      const scores = searchableFields.map((field) => ({ field, score: fieldScore(normalizedIntent, fields[field], field) }));
      const matchedFields = scores.filter(({ score }) => score > 0).map(({ field }) => field);
      const score = scores.reduce((total, entry) => total + entry.score, 0);
      return { id: pattern.id, title: pattern.title, category: pattern.category, purpose: pattern.purpose, score, matchedFields };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, limit);
}

/**
 * Experimental semantic-field retrieval. V2 keeps each field separate so its
 * score can explain why a Pattern was retrieved; it is not a recommendation.
 * `avoidWhen` is returned as post-retrieval conflict metadata and never alters
 * rank, because it describes a later candidate-comparison concern.
 */
export function searchPatternsV2(patterns: readonly EditingPattern[], query: PatternSearchQuery): PatternSearchResultV2[] {
  const normalizedIntent = normalize(query.intent);
  if (normalizedIntent.length === 0) return [];

  const limit = query.limit ?? defaultLimit;
  if (!Number.isInteger(limit) || limit < 1) throw new Error("Search limit must be a positive integer.");

  return patterns
    .filter((pattern) => query.category === undefined || pattern.category === query.category)
    .map((pattern) => {
      const fields = fieldsFor(pattern);
      const scores: Record<SearchV2PositiveField, number> = {
        id: fieldScore(normalizedIntent, fields.id, "id") * 10,
        title: fieldScore(normalizedIntent, fields.title, "title") * 5,
        purpose: fieldScore(normalizedIntent, fields.purpose, "purpose") * 2,
        goodFor: bestFieldScore(normalizedIntent, pattern.goodFor, "purpose") * 1.2,
        tags: bestFieldScore(normalizedIntent, pattern.tags, "category") * 0.35,
        category: fieldScore(normalizedIntent, fields.category, "category") * 0.25,
      };
      const matchedPositiveFields = searchV2PositiveFields.filter((field) => scores[field] > 0);
      const positiveScore = Object.values(scores).reduce((total, score) => total + score, 0);
      return {
        id: pattern.id,
        title: pattern.title,
        category: pattern.category,
        purpose: pattern.purpose,
        score: positiveScore,
        positiveScore,
        avoidWhenConflicts: avoidWhenConflicts(normalizedIntent, pattern),
        matchedPositiveFields,
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, limit);
}
