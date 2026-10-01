import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { ErrorObject, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import type {
  CompositionCatalog,
  SceneCompositionHandoff,
} from "../schema/composition.js";
import type {
  E03EvaluationExpectation,
  E05EvaluationExpectation,
  E07EvaluationExpectation,
  EvaluateSceneInput,
  EvaluationCheckResult,
  EvaluationContext,
  ExecutionCompositionState,
  ExecutionRegion,
  ExecutionStateLineage,
  Rectangle,
  SceneEvaluationExpectations,
  SceneEvaluationResult,
  SceneExecutionReport,
} from "../schema/evaluator.schema.js";

const schemaId = "https://github.com/ooishi1221/editing-grammar/schema/evaluator.schema.json";
const schema = JSON.parse(readFileSync(new URL("../schema/evaluator.schema.json", import.meta.url), "utf8")) as object;
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js").default as typeof import("ajv/dist/2020.js").Ajv2020;
const addFormats = require("ajv-formats").default as FormatsPlugin;
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(schema);

const validateExpectations = ajv.compile({ $ref: schemaId + "#/$defs/sceneEvaluationExpectations" });
const validateContext = ajv.compile({ $ref: schemaId + "#/$defs/evaluationContext" });
const validateExecutionReport = ajv.compile({ $ref: schemaId + "#/$defs/sceneExecutionReport" });

export class EvaluatorInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvaluatorInputError";
  }
}

interface ValidatedInput {
  regionsById: Map<string, ExecutionRegion>;
  statesById: Map<string, ExecutionCompositionState>;
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
  if (!validator(value)) throw new EvaluatorInputError(label + ": " + schemaErrorMessage(validator.errors));
}

function assertUnique(values: readonly string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new EvaluatorInputError("Duplicate " + label + ": " + value);
    seen.add(value);
  }
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new EvaluatorInputError(label + " must be a finite number.");
}

function assertRectangle(value: Rectangle, label: string): void {
  assertFiniteNumber(value.x, label + ".x");
  assertFiniteNumber(value.y, label + ".y");
  assertFiniteNumber(value.width, label + ".width");
  assertFiniteNumber(value.height, label + ".height");
  if (value.width <= 0 || value.height <= 0) {
    throw new EvaluatorInputError(label + " width and height must be greater than zero.");
  }
}

function findSelectedSequence(
  selectedComposition: SceneCompositionHandoff,
  sequenceReferenceId: string,
  preserveStateIds: readonly string[],
) {
  return selectedComposition.sequenceSelections.find((selection) =>
    selection.referenceId === sequenceReferenceId && sameIds(selection.stateBindings.preserve, preserveStateIds));
}

function assertExpectationRegions(
  expectations: SceneEvaluationExpectations,
  regionsById: ReadonlyMap<string, ExecutionRegion>,
): void {
  for (const expectation of expectations.checks) {
    const regionIds = expectation.checkId === "E03"
      ? [expectation.captionRegionId, ...expectation.avoidRegionIds]
      : expectation.checkId === "E05"
        ? expectation.regionIds
        : [];
    for (const regionId of regionIds) {
      if (!regionsById.has(regionId)) {
        throw new EvaluatorInputError("Expectation " + expectation.id + " references unknown execution region: " + regionId);
      }
    }
  }
}

function validateInput(input: EvaluateSceneInput): ValidatedInput {
  assertSchema(validateExpectations, input.expectations, "Invalid evaluation expectations");
  assertSchema(validateContext, input.context, "Invalid evaluation context");
  assertSchema(validateExecutionReport, input.executionReport, "Invalid execution report");

  const { compositionCatalog, selectedComposition, expectations, context, executionReport } = input;
  assertFiniteNumber(executionReport.canvas.width, "canvas.width");
  assertFiniteNumber(executionReport.canvas.height, "canvas.height");
  if (executionReport.canvas.width <= 0 || executionReport.canvas.height <= 0) {
    throw new EvaluatorInputError("canvas width and height must be greater than zero.");
  }

  assertUnique(expectations.checks.map((expectation) => expectation.id), "evaluation expectation ID");
  assertUnique(executionReport.regions.map((region) => region.id), "execution region ID");
  assertUnique(executionReport.compositionStates.map((state) => state.id), "execution composition state ID");

  for (const region of executionReport.regions) {
    if (region.bounds) assertRectangle(region.bounds, "Execution region " + region.id + " bounds");
    if (region.authoredIds) assertUnique(region.authoredIds, "authored ID in execution region " + region.id);
  }

  const frameReferenceIds = new Set(compositionCatalog.frameReferences.map((reference) => reference.id));
  const sequenceReferenceIds = new Set(compositionCatalog.sequenceReferences.map((reference) => reference.id));
  for (const state of executionReport.compositionStates) {
    if (!frameReferenceIds.has(state.frameReferenceId)) {
      throw new EvaluatorInputError("Unknown frameReferenceId in execution state " + state.id + ": " + state.frameReferenceId);
    }
  }

  for (const [safeAreaId, safeArea] of Object.entries(context.safeAreas ?? {})) {
    assertFiniteNumber(safeArea.left, "safe area " + safeAreaId + ".left");
    assertFiniteNumber(safeArea.top, "safe area " + safeAreaId + ".top");
    assertFiniteNumber(safeArea.right, "safe area " + safeAreaId + ".right");
    assertFiniteNumber(safeArea.bottom, "safe area " + safeAreaId + ".bottom");
    if (safeArea.left < 0 || safeArea.top < 0 || safeArea.right < 0 || safeArea.bottom < 0) {
      throw new EvaluatorInputError("Safe area " + safeAreaId + " has a negative inset.");
    }
    if (safeArea.left + safeArea.right >= executionReport.canvas.width || safeArea.top + safeArea.bottom >= executionReport.canvas.height) {
      throw new EvaluatorInputError("Safe area " + safeAreaId + " leaves no usable rectangle.");
    }
  }

  const regionsById = new Map(executionReport.regions.map((region) => [region.id, region]));
  const statesById = new Map(executionReport.compositionStates.map((state) => [state.id, state]));
  for (const state of executionReport.compositionStates) {
    for (const regionId of Object.values(state.regionBindings)) {
      if (!regionsById.has(regionId)) {
        throw new EvaluatorInputError("Unknown region binding in execution state " + state.id + ": " + regionId);
      }
    }
  }
  assertExpectationRegions(expectations, regionsById);

  for (const expectation of expectations.checks) {
    if (expectation.checkId !== "E07") continue;
    if (!sequenceReferenceIds.has(expectation.sequenceReferenceId)) {
      throw new EvaluatorInputError("Unknown sequenceReferenceId in expectation " + expectation.id + ": " + expectation.sequenceReferenceId);
    }
    if (!findSelectedSequence(selectedComposition, expectation.sequenceReferenceId, expectation.preserveStateIds)) {
      throw new EvaluatorInputError("E07 expectation " + expectation.id + " does not match a selected CS-04 preserve binding.");
    }
  }

  for (const lineage of executionReport.stateLineage) {
    if (!sequenceReferenceIds.has(lineage.sequenceReferenceId)) {
      throw new EvaluatorInputError("Unknown sequenceReferenceId in execution lineage: " + lineage.sequenceReferenceId);
    }
    if (!statesById.has(lineage.beforeStateId)) {
      throw new EvaluatorInputError("Unknown beforeStateId in execution lineage: " + lineage.beforeStateId);
    }
    if (!statesById.has(lineage.afterStateId)) {
      throw new EvaluatorInputError("Unknown afterStateId in execution lineage: " + lineage.afterStateId);
    }
    if (!findSelectedSequence(selectedComposition, lineage.sequenceReferenceId, lineage.preserveStateIds)) {
      throw new EvaluatorInputError("Execution lineage does not match a selected Sequence preserve binding: " + lineage.sequenceReferenceId);
    }
  }

  return { regionsById, statesById };
}

function intersection(left: Rectangle, right: Rectangle): Rectangle | undefined {
  const x = Math.max(left.x, right.x);
  const y = Math.max(left.y, right.y);
  const width = Math.min(left.x + left.width, right.x + right.width) - x;
  const height = Math.min(left.y + left.height, right.y + right.height) - y;
  return width > 0 && height > 0 ? { x, y, width, height } : undefined;
}

function evaluateE03(
  expectation: E03EvaluationExpectation,
  regionsById: ReadonlyMap<string, ExecutionRegion>,
): EvaluationCheckResult {
  const caption = regionsById.get(expectation.captionRegionId)!;
  const avoided = expectation.avoidRegionIds.map((regionId) => regionsById.get(regionId)!);
  if (!caption.bounds || avoided.some((region) => !region.bounds)) {
    return {
      id: "E03",
      expectationId: expectation.id,
      status: "skipped",
      message: "Caption or avoided region bounds are not observable.",
    };
  }

  const collisions = avoided.flatMap((region) => {
    const overlap = intersection(caption.bounds!, region.bounds!);
    return overlap ? [{
      avoidRegionId: region.id,
      intersection: { ...overlap, area: overlap.width * overlap.height },
    }] : [];
  });
  if (collisions.length > 0) {
    return {
      id: "E03",
      expectationId: expectation.id,
      status: "fail",
      message: "Caption overlaps one or more explicitly avoided regions.",
      evidence: {
        expectationId: expectation.id,
        captionRegionId: caption.id,
        collisions,
      },
    };
  }

  return {
    id: "E03",
    expectationId: expectation.id,
    status: "pass",
    message: "Caption avoids all explicitly named regions.",
    evidence: {
      expectationId: expectation.id,
      captionRegionId: caption.id,
      avoidRegionIds: expectation.avoidRegionIds,
    },
  };
}

function safeAreaBounds(context: EvaluationContext, safeAreaId: string, canvas: SceneExecutionReport["canvas"]): Rectangle | undefined {
  const safeArea = context.safeAreas?.[safeAreaId];
  return safeArea
    ? {
        x: safeArea.left,
        y: safeArea.top,
        width: canvas.width - safeArea.left - safeArea.right,
        height: canvas.height - safeArea.top - safeArea.bottom,
      }
    : undefined;
}

function isInside(inner: Rectangle, outer: Rectangle): boolean {
  return inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height;
}

function evaluateE05(
  expectation: E05EvaluationExpectation,
  context: EvaluationContext,
  report: SceneExecutionReport,
  regionsById: ReadonlyMap<string, ExecutionRegion>,
): EvaluationCheckResult {
  const allowedBounds = safeAreaBounds(context, expectation.safeAreaId, report.canvas);
  const regions = expectation.regionIds.map((regionId) => regionsById.get(regionId)!);
  if (!allowedBounds || regions.some((region) => !region.bounds)) {
    return {
      id: "E05",
      expectationId: expectation.id,
      status: "skipped",
      message: "Safe area or required region bounds are not observable.",
    };
  }

  const violations = regions.flatMap((region) => isInside(region.bounds!, allowedBounds)
    ? []
    : [{ regionId: region.id, actualBounds: region.bounds, allowedBounds }]);
  if (violations.length > 0) {
    return {
      id: "E05",
      expectationId: expectation.id,
      status: "fail",
      message: "One or more explicitly constrained regions fall outside the named safe area.",
      evidence: {
        expectationId: expectation.id,
        safeAreaId: expectation.safeAreaId,
        violations,
      },
    };
  }

  return {
    id: "E05",
    expectationId: expectation.id,
    status: "pass",
    message: "All explicitly constrained regions remain inside the named safe area.",
    evidence: {
      expectationId: expectation.id,
      safeAreaId: expectation.safeAreaId,
      regionIds: expectation.regionIds,
      allowedBounds,
    },
  };
}

function bindingDiff(
  before: Record<string, string>,
  after: Record<string, string>,
): Record<string, { before?: string; after?: string }> {
  const changed: Record<string, { before?: string; after?: string }> = {};
  for (const key of [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()) {
    if (before[key] !== after[key]) changed[key] = { before: before[key], after: after[key] };
  }
  return changed;
}

function holdDiff(before: ExecutionCompositionState, after: ExecutionCompositionState): Record<string, unknown> {
  const changed: Record<string, unknown> = {};
  if (before.frameReferenceId !== after.frameReferenceId) {
    changed.frameReferenceId = { before: before.frameReferenceId, after: after.frameReferenceId };
  }
  const subjectBindings = bindingDiff(before.subjectBindings, after.subjectBindings);
  if (Object.keys(subjectBindings).length > 0) changed.subjectBindings = subjectBindings;
  const regionBindings = bindingDiff(before.regionBindings, after.regionBindings);
  if (Object.keys(regionBindings).length > 0) changed.regionBindings = regionBindings;
  return changed;
}

function matchingLineage(
  expectation: E07EvaluationExpectation,
  lineage: readonly ExecutionStateLineage[],
): ExecutionStateLineage[] {
  return lineage.filter((entry) =>
    entry.sequenceReferenceId === expectation.sequenceReferenceId &&
    sameIds(entry.preserveStateIds, expectation.preserveStateIds));
}

function evaluateE07(
  expectation: E07EvaluationExpectation,
  report: SceneExecutionReport,
  statesById: ReadonlyMap<string, ExecutionCompositionState>,
): EvaluationCheckResult {
  const matching = matchingLineage(expectation, report.stateLineage);
  if (matching.length === 0) {
    return {
      id: "E07",
      expectationId: expectation.id,
      status: "skipped",
      message: "No execution lineage was emitted for the selected CS-04 HOLD relationship.",
    };
  }

  const violations = matching.flatMap((lineage) => {
    const before = statesById.get(lineage.beforeStateId)!;
    const after = statesById.get(lineage.afterStateId)!;
    const changed = holdDiff(before, after);
    return Object.keys(changed).length > 0
      ? [{ beforeStateId: before.id, afterStateId: after.id, changed }]
      : [];
  });
  if (violations.length > 0) {
    return {
      id: "E07",
      expectationId: expectation.id,
      status: "fail",
      message: "Selected CS-04 HOLD changed its rendered composition state.",
      evidence: {
        expectationId: expectation.id,
        sequenceReferenceId: expectation.sequenceReferenceId,
        preserveStateIds: expectation.preserveStateIds,
        violations,
      },
    };
  }

  return {
    id: "E07",
    expectationId: expectation.id,
    status: "pass",
    message: "Selected CS-04 HOLD preserved frame, subject bindings, and region bindings.",
    evidence: {
      expectationId: expectation.id,
      sequenceReferenceId: expectation.sequenceReferenceId,
      preserveStateIds: expectation.preserveStateIds,
      lineage: matching.map((entry) => ({ beforeStateId: entry.beforeStateId, afterStateId: entry.afterStateId })),
    },
  };
}

/** Evaluates optional scene expectations against renderer-neutral execution facts. */
export function evaluateScene(input: EvaluateSceneInput): SceneEvaluationResult {
  const { regionsById, statesById } = validateInput(input);
  const checks = input.expectations.checks.map((expectation) => {
    if (expectation.checkId === "E03") return evaluateE03(expectation, regionsById);
    if (expectation.checkId === "E05") return evaluateE05(expectation, input.context, input.executionReport, regionsById);
    return evaluateE07(expectation, input.executionReport, statesById);
  });
  return {
    checks,
    hasFailures: checks.some((check) => check.status === "fail"),
  };
}
