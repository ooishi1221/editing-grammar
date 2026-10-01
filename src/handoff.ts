import type {
  EditingPattern,
  ImplementationParameterDeclaration,
  PatternCategory,
  PatternEvidence,
} from "../schema/pattern.js";
import type { SceneCompositionHandoff } from "../schema/composition.js";

export type HandoffStatus = "current-contract" | "historical-exception" | "semantic-only";

export interface HandoffContext {
  scene?: Record<string, unknown>;
  brand?: Record<string, unknown>;
  platform?: Record<string, unknown>;
}

export interface ImplementationHandoff {
  pattern: {
    id: string;
    title: string;
    category: PatternCategory;
  };
  status: HandoffStatus;
  grammar: {
    visual?: EditingPattern["visual"];
    audio?: EditingPattern["audio"];
    timing?: EditingPattern["timing"];
    recipe?: string[];
  } | null;
  inputs: {
    declarations: Record<string, ImplementationParameterDeclaration>;
    suppliedValues: Record<string, unknown>;
    unresolved: string[];
  };
  provenance: {
    implementationEvidence: PatternEvidence[];
  };
  context: HandoffContext;
  historicalMetadata?: Record<string, unknown>;
}

export interface SceneImplementationHandoff {
  patterns: ImplementationHandoff[];
  composition?: SceneCompositionHandoff;
  context: HandoffContext;
}

export interface ImplementationHandoffOptions {
  suppliedValues?: Record<string, unknown>;
  context?: HandoffContext;
  includeHistoricalMetadata?: boolean;
}

export interface ImplementationHandoffSelection {
  patternId: string;
  suppliedValues?: Record<string, unknown>;
  includeHistoricalMetadata?: boolean;
}

export const currentContractIds: ReadonlySet<string> = new Set([
  "VS-T01", "VS-T02", "VS-T03", "VS-T04", "VS-T05", "VS-T06", "VS-T07", "VS-T08", "VS-T10", "VS-T12", "VS-T13", "VS-T14",
  "VS-R01", "VS-R02", "VS-R03", "VS-R04", "VS-R05", "VS-R06", "VS-R07", "VS-R08", "VS-R11", "VS-R12",
  "VS-I01", "VS-I02", "VS-I03", "VS-I05", "VS-I06", "VS-I07", "VS-I08", "VS-I09", "VS-I10", "VS-I11", "VS-I12", "VS-I13", "VS-I14", "VS-I15",
  "VS-L01", "VS-L02", "VS-L03", "VS-L04", "VS-L05", "VS-L06", "VS-L07", "VS-L08", "VS-L09", "VS-L10",
  "VS-E01", "VS-E02", "VS-E03", "VS-E04", "VS-E05", "VS-E06", "VS-E07", "VS-E08", "VS-E09", "VS-E10",
  "VS-A01", "VS-A02", "VS-A04", "VS-A05", "VS-A06", "VS-A08",
  "VS-G01", "VS-G02", "VS-G03", "VS-G04", "VS-G05", "VS-G06", "VS-G07", "VS-G08",
  "VS-C01", "VS-C02", "VS-C03", "VS-C04", "VS-C05", "VS-C06",
  "VS-S01", "VS-S02", "VS-S03", "VS-S04",
  "VS-B02", "VS-B03",
]);
export const historicalExceptionIds: ReadonlySet<string> = new Set(["VS-T11", "VS-I04", "VS-A03"]);
export const semanticOnlyIds: ReadonlySet<string> = new Set(["VS-T09", "VS-R09", "VS-R10", "VS-A07", "VS-B01", "VS-B04", "VS-B05", "VS-B06"]);

function copyValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((entry) => copyValue(entry)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, copyValue(entry)])) as T;
  }
  return value;
}

function copyEvidence(evidence: PatternEvidence[]): PatternEvidence[] {
  return evidence.map((entry) => ({
    ...entry,
    scope: [...entry.scope],
    ...(entry.source === undefined ? {} : { source: { ...entry.source } }),
  }));
}

function implementationEvidence(pattern: EditingPattern): PatternEvidence[] {
  return copyEvidence(pattern.evidence.filter((entry) => entry.scope.some((scope) => (
    scope === "visual" || scope.startsWith("visual.")
    || scope === "audio" || scope.startsWith("audio.")
    || scope === "timing" || scope.startsWith("timing.")
    || scope === "implementation" || scope.startsWith("implementation.")
  ))));
}

function statusFor(patternId: string): HandoffStatus {
  if (currentContractIds.has(patternId)) return "current-contract";
  if (historicalExceptionIds.has(patternId)) return "historical-exception";
  if (semanticOnlyIds.has(patternId)) return "semantic-only";
  throw new Error(`Unclassified Pattern for handoff: ${patternId}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function valueMatchesType(value: unknown, valueType: ImplementationParameterDeclaration["valueType"]): boolean {
  if (valueType === "string") return typeof value === "string";
  if (valueType === "number") return typeof value === "number" && Number.isFinite(value);
  if (valueType === "boolean") return typeof value === "boolean";
  if (valueType === "array") return Array.isArray(value);
  return isRecord(value);
}

function copyDeclarations(pattern: EditingPattern): Record<string, ImplementationParameterDeclaration> {
  return Object.fromEntries(Object.entries(pattern.implementation?.parameters ?? {}).map(([key, declaration]) => [key, copyValue(declaration)]));
}

function resolveInputs(
  declarations: Record<string, ImplementationParameterDeclaration>,
  suppliedValues: Record<string, unknown> | undefined,
): ImplementationHandoff["inputs"] {
  if (suppliedValues !== undefined && !isRecord(suppliedValues)) throw new Error("suppliedValues must be a JSON object.");

  const supplied: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(suppliedValues ?? {})) {
    const declaration = declarations[key];
    if (declaration === undefined) throw new Error(`Unknown supplied parameter: ${key}`);
    if (declaration.kind === "constant") throw new Error(`Cannot override constant parameter: ${key}`);
    if (!valueMatchesType(value, declaration.valueType)) {
      throw new Error(`Invalid value for ${key}: expected ${declaration.valueType}.`);
    }
    supplied[key] = copyValue(value);
  }

  const unresolved = Object.entries(declarations)
    .filter(([key, declaration]) => declaration.kind !== "constant" && declaration.required && !(key in supplied))
    .map(([key]) => key);

  return { declarations, suppliedValues: supplied, unresolved };
}

function currentContractGrammar(pattern: EditingPattern): NonNullable<ImplementationHandoff["grammar"]> {
  return {
    ...(pattern.visual === undefined ? {} : { visual: copyValue(pattern.visual) }),
    ...(pattern.audio === undefined ? {} : { audio: copyValue(pattern.audio) }),
    ...(pattern.timing === undefined ? {} : { timing: copyValue(pattern.timing) }),
    ...(pattern.implementation?.recipe === undefined ? {} : { recipe: [...pattern.implementation.recipe] }),
  };
}

function historicalProjection(pattern: EditingPattern): NonNullable<ImplementationHandoff["grammar"]> {
  if (pattern.id === "VS-T11") {
    const motion = pattern.visual?.motion;
    return {
      ...(motion === undefined ? {} : { visual: { motion: { type: motion.type, trigger: motion.trigger } } }),
      ...(pattern.implementation?.recipe === undefined ? {} : { recipe: [...pattern.implementation.recipe] }),
    };
  }
  if (pattern.id === "VS-I04") {
    const layout = pattern.visual?.layout;
    return {
      ...(layout === undefined ? {} : { visual: { layout: { type: layout.type } } }),
      ...(pattern.implementation?.recipe === undefined ? {} : { recipe: [...pattern.implementation.recipe] }),
    };
  }
  if (pattern.id === "VS-A03") {
    const audio = pattern.audio;
    return {
      ...(audio === undefined ? {} : {
        audio: {
          type: audio.type,
          cue: audio.cue,
          sync: audio.sync,
          notes: audio.notes,
        },
      }),
      ...(pattern.timing === undefined ? {} : { timing: copyValue(pattern.timing) }),
      ...(pattern.implementation?.recipe === undefined ? {} : { recipe: [...pattern.implementation.recipe] }),
    };
  }
  throw new Error(`Unknown historical exception: ${pattern.id}`);
}

function historicalMetadata(pattern: EditingPattern): Record<string, unknown> {
  if (pattern.id === "VS-T11") {
    const motion = pattern.visual?.motion;
    return {
      visual: {
        motion: {
          ...(motion?.durationFrames === undefined ? {} : { durationFrames: [...motion.durationFrames] }),
          ...(motion?.easing === undefined ? {} : { easing: motion.easing }),
          ...(motion?.parameters === undefined ? {} : { parameters: copyValue(motion.parameters) }),
        },
      },
      ...(pattern.implementation?.rendererCandidates === undefined ? {} : { rendererCandidates: [...pattern.implementation.rendererCandidates] }),
    };
  }
  if (pattern.id === "VS-I04") {
    const layout = pattern.visual?.layout;
    return {
      visual: {
        layout: {
          ...(layout?.position === undefined ? {} : { position: layout.position }),
          ...(layout?.safeArea === undefined ? {} : { safeArea: layout.safeArea }),
        },
      },
      ...(pattern.implementation?.rendererCandidates === undefined ? {} : { rendererCandidates: [...pattern.implementation.rendererCandidates] }),
    };
  }
  if (pattern.id === "VS-A03") {
    return {
      audio: {
        ...(pattern.audio?.optional === undefined ? {} : { optional: pattern.audio.optional }),
      },
      ...(pattern.implementation?.rendererCandidates === undefined ? {} : { rendererCandidates: [...pattern.implementation.rendererCandidates] }),
    };
  }
  throw new Error(`Unknown historical exception: ${pattern.id}`);
}

/** Builds a portable, read-only projection of one already-selected Pattern. */
export function buildImplementationHandoff(
  pattern: EditingPattern,
  options: ImplementationHandoffOptions = {},
): ImplementationHandoff {
  const status = statusFor(pattern.id);
  const context = copyValue(options.context ?? {});
  const base = {
    pattern: { id: pattern.id, title: pattern.title, category: pattern.category },
    status,
    context,
  } as const;

  if (status === "semantic-only") {
    const inputs = resolveInputs({}, options.suppliedValues);
    return {
      ...base,
      grammar: null,
      inputs,
      provenance: { implementationEvidence: [] },
    };
  }

  if (status === "historical-exception") {
    const inputs = resolveInputs({}, options.suppliedValues);
    return {
      ...base,
      grammar: historicalProjection(pattern),
      inputs,
      provenance: { implementationEvidence: implementationEvidence(pattern) },
      ...(options.includeHistoricalMetadata ? { historicalMetadata: historicalMetadata(pattern) } : {}),
    };
  }

  const declarations = copyDeclarations(pattern);
  return {
    ...base,
    grammar: currentContractGrammar(pattern),
    inputs: resolveInputs(declarations, options.suppliedValues),
    provenance: { implementationEvidence: implementationEvidence(pattern) },
  };
}

/** Wraps selected Patterns in caller-provided order without orchestration. */
export function buildSceneImplementationHandoff(
  patterns: readonly EditingPattern[],
  selections: readonly ImplementationHandoffSelection[],
  context: HandoffContext = {},
  composition?: SceneCompositionHandoff,
): SceneImplementationHandoff {
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  return {
    patterns: selections.map((selection) => {
      const pattern = patternsById.get(selection.patternId);
      if (pattern === undefined) throw new Error(`Pattern not found: ${selection.patternId}`);
      return buildImplementationHandoff(pattern, {
        suppliedValues: selection.suppliedValues,
        context,
        includeHistoricalMetadata: selection.includeHistoricalMetadata,
      });
    }),
    ...(composition === undefined ? {} : { composition: copyValue(composition) }),
    context: copyValue(context),
  };
}
