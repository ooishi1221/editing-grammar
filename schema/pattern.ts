export type EvidenceType = "observed" | "inferred" | "proposal";

export interface PatternEvidence {
  type: EvidenceType;
  sourceName: string;
  sourceUrl?: string;
  sourceLocation?: string;
  confidence: number;
}

export interface Pattern {
  id: string;
  title: string;
  category: string;
  purpose: string[];
  description: string;
  goodFor: string[];
  avoidWhen: string[];
  tags: string[];
  evidence: PatternEvidence;
  visual?: Record<string, unknown>;
  audio?: Record<string, unknown>;
  timing?: Record<string, unknown>;
  implementation?: Record<string, unknown>;
}
