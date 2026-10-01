import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { ErrorObject, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import type { CompositionSequenceSelection, SceneCompositionHandoff } from "../schema/composition.js";
import type {
  BuildShotPlanHandoffInput,
  SemanticScene,
  ShotPlanHandoff,
  ShotPlanHandoffStep,
  ShotPlanStep,
} from "../schema/shot-plan.schema.js";

const schemaId = "https://github.com/ooishi1221/editing-grammar/schema/shot-plan.schema.json";
const schema = JSON.parse(readFileSync(new URL("../schema/shot-plan.schema.json", import.meta.url), "utf8")) as object;
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js").default as typeof import("ajv/dist/2020.js").Ajv2020;
const addFormats = require("ajv-formats").default as FormatsPlugin;
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(schema);

const validateSemanticScene = ajv.compile({ $ref: schemaId + "#/$defs/semanticScene" });
const validateShotPlan = ajv.compile({ $ref: schemaId + "#/$defs/shotPlan" });

export class ShotPlanValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShotPlanValidationError";
  }
}

function copyValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((entry) => copyValue(entry)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, copyValue(entry)])) as T;
  }
  return value;
}

function schemaErrorMessage(errors: ErrorObject[] | null | undefined): string {
  return (errors ?? []).map((error) => {
    const missing = error.keyword === "required" && typeof error.params.missingProperty === "string"
      ? "/" + error.params.missingProperty
      : "";
    return (error.instancePath || "/") + missing + " " + (error.message ?? "schema validation failed");
  }).join("; ");
}

function assertSchema(validator: ValidateFunction, value: unknown, label: string): void {
  if (!validator(value)) throw new ShotPlanValidationError(label + ": " + schemaErrorMessage(validator.errors));
}

function assertUnique(values: readonly string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new ShotPlanValidationError("Duplicate " + label + ": " + value);
    seen.add(value);
  }
}

function validateScene(scene: SemanticScene): void {
  assertSchema(validateSemanticScene, scene, "Invalid semantic scene");
  assertUnique(scene.beats.map((beat) => beat.id), "semantic beat ID");
  for (const beat of scene.beats) {
    if (beat.sourceRange === undefined) continue;
    const { startMs, endMs } = beat.sourceRange;
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      throw new ShotPlanValidationError("Source range for beat " + beat.id + " must contain finite milliseconds.");
    }
    if (endMs <= startMs) {
      throw new ShotPlanValidationError("Source range for beat " + beat.id + " must end after it starts.");
    }
  }
}

function selectionMaps(composition: SceneCompositionHandoff): {
  frameSelectionIds: Set<string>;
  sequenceSelectionsById: Map<string, CompositionSequenceSelection>;
} {
  assertUnique(composition.frameSelections.map((selection) => selection.id), "composition frame selection ID");
  const selectionsWithIds = composition.sequenceSelections.flatMap((selection) => selection.id === undefined ? [] : [selection]);
  assertUnique(selectionsWithIds.map((selection) => selection.id!), "composition sequence selection ID");
  return {
    frameSelectionIds: new Set(composition.frameSelections.map((selection) => selection.id)),
    sequenceSelectionsById: new Map(selectionsWithIds.map((selection) => [selection.id!, selection])),
  };
}

function assertSequenceSelection(
  step: ShotPlanStep,
  sequenceSelectionsById: ReadonlyMap<string, CompositionSequenceSelection>,
): CompositionSequenceSelection | undefined {
  if (step.sequenceSelectionId === undefined) return undefined;
  const selection = sequenceSelectionsById.get(step.sequenceSelectionId);
  if (selection === undefined) {
    throw new ShotPlanValidationError("Unknown sequenceSelectionId for step " + step.id + ": " + step.sequenceSelectionId);
  }
  return selection;
}

function assertFrameSelection(step: ShotPlanStep, frameSelectionIds: ReadonlySet<string>): string {
  if (step.frameSelectionId === undefined) {
    throw new ShotPlanValidationError(step.decision + " step " + step.id + " requires frameSelectionId.");
  }
  if (!frameSelectionIds.has(step.frameSelectionId)) {
    throw new ShotPlanValidationError("Unknown frameSelectionId for step " + step.id + ": " + step.frameSelectionId);
  }
  return step.frameSelectionId;
}

function assertPatternIds(step: ShotPlanStep, patternIds: ReadonlySet<string>): void {
  for (const patternId of step.patternIds ?? []) {
    if (!patternIds.has(patternId)) {
      throw new ShotPlanValidationError("Unknown Pattern ID for step " + step.id + ": " + patternId);
    }
  }
}

function resolvedStep(step: ShotPlanStep, resolvedFrameSelectionId: string): ShotPlanHandoffStep {
  return {
    id: step.id,
    beatId: step.beatId,
    decision: step.decision,
    rationale: step.rationale,
    ...(step.patternIds === undefined ? {} : { patternIds: [...step.patternIds] }),
    ...(step.frameSelectionId === undefined ? {} : { frameSelectionId: step.frameSelectionId }),
    ...(step.sequenceSelectionId === undefined ? {} : { sequenceSelectionId: step.sequenceSelectionId }),
    ...(step.returnToStepId === undefined ? {} : { returnToStepId: step.returnToStepId }),
    resolvedFrameSelectionId,
  };
}

/**
 * Builds a renderer-neutral, beat-ordered Shot Plan handoff from Agent-authored
 * semantic decisions and an already validated Scene Composition Handoff.
 */
export function buildShotPlanHandoff(input: BuildShotPlanHandoffInput): ShotPlanHandoff {
  const { patterns, composition, scene, plan } = input;
  validateScene(scene);
  assertSchema(validateShotPlan, plan, "Invalid shot plan");
  if (plan.sceneId !== scene.sceneId) {
    throw new ShotPlanValidationError("Shot Plan sceneId does not match SemanticScene sceneId.");
  }
  assertUnique(plan.steps.map((step) => step.id), "shot plan step ID");
  assertUnique(plan.steps.map((step) => step.beatId), "shot plan beat reference");
  if (plan.steps.length !== scene.beats.length) {
    throw new ShotPlanValidationError("Shot Plan must contain exactly one step for every SemanticScene beat.");
  }
  const sceneBeatIds = new Set(scene.beats.map((beat) => beat.id));
  for (const step of plan.steps) {
    if (!sceneBeatIds.has(step.beatId)) {
      throw new ShotPlanValidationError("Unknown beatId for step " + step.id + ": " + step.beatId);
    }
  }
  for (let index = 0; index < scene.beats.length; index += 1) {
    if (plan.steps[index]?.beatId !== scene.beats[index]?.id) {
      throw new ShotPlanValidationError("Shot Plan step order must exactly follow SemanticScene beat order.");
    }
  }
  if (plan.steps[0]?.decision !== "establish") {
    throw new ShotPlanValidationError("First Shot Plan step must be establish.");
  }
  if (plan.steps.filter((step) => step.decision === "establish").length !== 1) {
    throw new ShotPlanValidationError("Shot Plan must contain exactly one establish step.");
  }

  const { frameSelectionIds, sequenceSelectionsById } = selectionMaps(composition);
  const patternIds = new Set(patterns.map((pattern) => pattern.id));
  const resolvedByStepId = new Map<string, ShotPlanHandoffStep>();
  const steps: ShotPlanHandoffStep[] = [];

  for (let index = 0; index < plan.steps.length; index += 1) {
    const step = plan.steps[index]!;
    assertPatternIds(step, patternIds);
    const sequenceSelection = assertSequenceSelection(step, sequenceSelectionsById);
    let resolvedFrameSelectionId: string;

    if (step.decision === "establish" || step.decision === "switch" || step.decision === "insert") {
      if (step.returnToStepId !== undefined) {
        throw new ShotPlanValidationError(step.decision + " step " + step.id + " must not contain returnToStepId.");
      }
      resolvedFrameSelectionId = assertFrameSelection(step, frameSelectionIds);
    } else if (step.decision === "return") {
      if (step.frameSelectionId !== undefined) {
        throw new ShotPlanValidationError("return step " + step.id + " must resolve frame state through returnToStepId.");
      }
      if (step.returnToStepId === undefined) {
        throw new ShotPlanValidationError("return step " + step.id + " requires returnToStepId.");
      }
      const target = resolvedByStepId.get(step.returnToStepId);
      if (target === undefined) {
        throw new ShotPlanValidationError("return step " + step.id + " must reference an earlier plan step: " + step.returnToStepId);
      }
      resolvedFrameSelectionId = target.resolvedFrameSelectionId;
    } else {
      if (step.frameSelectionId !== undefined) {
        throw new ShotPlanValidationError("hold step " + step.id + " must resolve the current frame state rather than declare frameSelectionId.");
      }
      if (sequenceSelection === undefined) {
        throw new ShotPlanValidationError("hold step " + step.id + " requires sequenceSelectionId for selected CS-04.");
      }
      if (sequenceSelection.referenceId !== "CS-04") {
        throw new ShotPlanValidationError("hold step " + step.id + " must reference a selected CS-04 sequence instance.");
      }
      const preceding = steps.at(-1);
      if (preceding === undefined) {
        throw new ShotPlanValidationError("hold step " + step.id + " requires a preceding visual state.");
      }
      resolvedFrameSelectionId = preceding.resolvedFrameSelectionId;
    }

    const output = resolvedStep(step, resolvedFrameSelectionId);
    steps.push(output);
    resolvedByStepId.set(output.id, output);
  }

  return {
    planId: plan.planId,
    sceneId: plan.sceneId,
    steps: copyValue(steps),
  };
}
