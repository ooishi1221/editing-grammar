export type PatternCategory =
  | "captions" | "reactions" | "information" | "layout" | "transitions"
  | "audio" | "game_ui" | "branding" | "retention" | "shorts";

export type EvidenceType = "observed" | "inferred" | "proposal";

export type ImplementationParameterKind = "runtime-input" | "context" | "constant";
export type ImplementationParameterValueType = "string" | "number" | "boolean" | "object" | "array";
export type LegacyImplementationParameter = string | number | boolean;

export interface RuntimeInputParameterDeclaration {
  kind: "runtime-input";
  description: string;
  required: boolean;
  valueType: ImplementationParameterValueType;
}

export interface ContextParameterDeclaration {
  kind: "context";
  description: string;
  required: boolean;
  valueType: ImplementationParameterValueType;
}

export type ConstantParameterDeclaration =
  | { kind: "constant"; description: string; required: false; valueType: "string"; value: string }
  | { kind: "constant"; description: string; required: false; valueType: "number"; value: number }
  | { kind: "constant"; description: string; required: false; valueType: "boolean"; value: boolean }
  | { kind: "constant"; description: string; required: false; valueType: "object"; value: Record<string, unknown> }
  | { kind: "constant"; description: string; required: false; valueType: "array"; value: unknown[] };

export type ImplementationParameterDeclaration =
  | RuntimeInputParameterDeclaration
  | ContextParameterDeclaration
  | ConstantParameterDeclaration;

export interface SourceMetadata {
  name: string;
  url?: string;
  location: string;
  category?: string;
  classification?: string;
}

export interface PatternEvidence {
  type: EvidenceType;
  confidence: number;
  scope: string[];
  source?: SourceMetadata;
}

export interface EditingPattern {
  id: string;
  title: string;
  category: PatternCategory;
  purpose: string[];
  description?: string;
  goodFor: string[];
  avoidWhen: string[];
  tags: string[];
  visual?: {
    palette?: string[];
    typography?: { style?: string; weight?: string; case?: string; alignment?: string };
    layout?: { type?: string; position?: string; safeArea?: string };
    motion?: { type?: string; trigger?: string; durationFrames?: [number, number]; easing?: string; parameters?: Record<string, string | number | boolean> };
    transition?: { type?: string; direction?: string; durationFrames?: [number, number] };
  };
  audio?: { type?: string; cue?: string; sync?: string; optional?: boolean; notes?: string };
  timing?: { trigger?: string; duration?: string; beatRelation?: string };
  implementation?: {
    deterministic?: boolean;
    recipe?: string[];
    rendererCandidates?: string[];
    parameters?: Record<string, LegacyImplementationParameter | ImplementationParameterDeclaration>;
  };
  requirements?: string[];
  failureModes?: string[];
  relatedPatterns?: string[];
  evidence: PatternEvidence[];
}

/** @deprecated Use EditingPattern. */
export type Pattern = EditingPattern;
