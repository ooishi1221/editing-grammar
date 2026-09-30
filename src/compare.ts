import type { EditingPattern, PatternEvidence, PatternCategory } from "../schema/pattern.js";
import type { PatternSearchResultV2, SearchV2PositiveField } from "./search.js";

export interface CandidateComparison {
  rank: number;
  pattern: {
    id: string;
    title: string;
    category: PatternCategory;
  };
  retrieval: {
    matchedPositiveFields: SearchV2PositiveField[];
    retrievalScore: number;
    avoidWhenConflicts: string[];
  };
  decision: {
    purpose: string[];
    goodFor: string[];
    avoidWhen: string[];
    tags: string[];
  };
  provenance: {
    evidence: PatternEvidence[];
  };
}

function copyEvidence(evidence: PatternEvidence[]): PatternEvidence[] {
  return evidence.map((entry) => ({
    ...entry,
    scope: [...entry.scope],
    ...(entry.source === undefined ? {} : { source: { ...entry.source } }),
  }));
}

/**
 * Joins Search v2 results to stored Pattern data without evaluating, scoring,
 * filtering, or reordering candidates.
 */
export function buildCandidateComparisons(
  patterns: readonly EditingPattern[],
  searchResults: readonly PatternSearchResultV2[],
): CandidateComparison[] {
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  return searchResults.map((result, index) => {
    const pattern = patternsById.get(result.id);
    if (pattern === undefined) throw new Error(`Search result references missing Pattern: ${result.id}`);

    return {
      rank: index + 1,
      pattern: {
        id: pattern.id,
        title: pattern.title,
        category: pattern.category,
      },
      retrieval: {
        matchedPositiveFields: [...result.matchedPositiveFields],
        retrievalScore: result.score,
        avoidWhenConflicts: [...result.avoidWhenConflicts],
      },
      decision: {
        purpose: [...pattern.purpose],
        goodFor: [...pattern.goodFor],
        avoidWhen: [...pattern.avoidWhen],
        tags: [...pattern.tags],
      },
      provenance: {
        evidence: copyEvidence(pattern.evidence),
      },
    };
  });
}
