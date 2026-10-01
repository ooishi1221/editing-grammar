import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseDocument } from "yaml";
import type { SceneCompositionInput } from "../schema/composition.js";
import type {
  EvaluationCheckResult,
  EvaluationContext,
  SceneEvaluationExpectations,
  SceneExecutionReport,
} from "../schema/evaluator.schema.js";
import { buildSceneCompositionHandoff, loadCompositionCatalog } from "../src/composition.js";
import { evaluateScene, EvaluatorInputError } from "../src/evaluator.js";
import { buildImplementationHandoff } from "../src/handoff.js";
import { loadPatterns } from "../src/load.js";
import { searchPatternsV2 } from "../src/search.js";

interface EvaluatorFixture {
  selectedComposition: SceneCompositionInput;
  expectations: SceneEvaluationExpectations;
  context: EvaluationContext;
  executionReport: SceneExecutionReport;
}

const root = new URL("../", import.meta.url);

async function fixture(): Promise<EvaluatorFixture> {
  const document = parseDocument(
    await readFile(new URL("tests/fixtures/evaluator/vertical-short-mixed.yaml", root), "utf8"),
    { prettyErrors: true, uniqueKeys: true },
  );
  assert.equal(document.errors.length, 0, document.errors.map((error) => error.message).join("\n"));
  return document.toJS() as EvaluatorFixture;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function resultFor(result: { checks: EvaluationCheckResult[] }, expectationId: string): EvaluationCheckResult {
  const check = result.checks.find((candidate) => candidate.expectationId === expectationId);
  assert.ok(check, "missing result for " + expectationId);
  return check;
}

async function evaluate(input: EvaluatorFixture) {
  const compositionCatalog = await loadCompositionCatalog();
  return evaluateScene({
    compositionCatalog,
    selectedComposition: buildSceneCompositionHandoff(compositionCatalog, input.selectedComposition),
    expectations: input.expectations,
    context: input.context,
    executionReport: input.executionReport,
  });
}

test("production evaluator reports the canonical E03 fail, E05 pass, and E07 pass", async () => {
  const result = await evaluate(await fixture());

  assert.equal(resultFor(result, "caption-avoids-guest").status, "fail");
  assert.deepEqual(resultFor(result, "caption-avoids-guest").evidence, {
    expectationId: "caption-avoids-guest",
    captionRegionId: "caption-main",
    collisions: [{
      avoidRegionId: "guest-face",
      intersection: { x: 360, y: 1100, width: 300, height: 120, area: 36000 },
    }],
  });
  assert.equal(resultFor(result, "caption-inside-short-safe-area").status, "pass");
  assert.equal(resultFor(result, "hold-reaction-frame").status, "pass");
  assert.equal(result.hasFailures, true);
});

test("E03 passes when the named caption moves away and skips without observable bounds", async () => {
  const moved = clone(await fixture());
  const caption = moved.executionReport.regions.find((region) => region.id === "caption-main");
  assert.ok(caption?.bounds);
  caption.bounds = { ...caption.bounds, x: 60, y: 200 };
  assert.equal(resultFor(await evaluate(moved), "caption-avoids-guest").status, "pass");

  const unavailable = clone(await fixture());
  unavailable.executionReport.regions.find((region) => region.id === "caption-main")!.bounds = undefined;
  assert.equal(resultFor(await evaluate(unavailable), "caption-avoids-guest").status, "skipped");
});

test("E05 fails outside its named safe area and skips when that optional safe area is absent", async () => {
  const outside = clone(await fixture());
  const caption = outside.executionReport.regions.find((region) => region.id === "caption-main");
  assert.ok(caption?.bounds);
  caption.bounds = { ...caption.bounds, x: 0 };
  assert.equal(resultFor(await evaluate(outside), "caption-inside-short-safe-area").status, "fail");

  const unavailable = clone(await fixture());
  unavailable.context.safeAreas = {};
  assert.equal(resultFor(await evaluate(unavailable), "caption-inside-short-safe-area").status, "skipped");
});

test("E07 reports structured diffs for frame, subject, and region binding changes", async () => {
  const frameChanged = clone(await fixture());
  frameChanged.executionReport.compositionStates.find((state) => state.id === "after")!.frameReferenceId = "CF-01";
  const frameResult = resultFor(await evaluate(frameChanged), "hold-reaction-frame");
  assert.equal(frameResult.status, "fail");
  assert.deepEqual(frameResult.evidence, {
    expectationId: "hold-reaction-frame",
    sequenceReferenceId: "CS-04",
    preserveStateIds: ["held-reaction"],
    violations: [{
      beforeStateId: "before",
      afterStateId: "after",
      changed: { frameReferenceId: { before: "CF-02", after: "CF-01" } },
    }],
  });

  const subjectChanged = clone(await fixture());
  subjectChanged.executionReport.compositionStates.find((state) => state.id === "after")!.subjectBindings.selectedSubject = "host";
  assert.equal(resultFor(await evaluate(subjectChanged), "hold-reaction-frame").status, "fail");

  const regionChanged = clone(await fixture());
  regionChanged.executionReport.regions.push({
    id: "guest-face-shifted",
    bounds: { x: 720, y: 980, width: 300, height: 300 },
    authoredIds: ["guest"],
  });
  regionChanged.executionReport.compositionStates.find((state) => state.id === "after")!.regionBindings.primarySubject = "guest-face-shifted";
  assert.equal(resultFor(await evaluate(regionChanged), "hold-reaction-frame").status, "fail");
});

test("E07 skips when valid execution metadata has no matching CS-04 lineage", async () => {
  const unavailable = clone(await fixture());
  unavailable.executionReport.stateLineage = [];

  assert.equal(resultFor(await evaluate(unavailable), "hold-reaction-frame").status, "skipped");
});

test("malformed evaluator inputs throw instead of becoming skipped", async () => {
  const cases: Array<{ name: string; mutate: (input: EvaluatorFixture) => void; message: RegExp }> = [
    {
      name: "duplicate region ID",
      mutate: (input) => input.executionReport.regions.push(clone(input.executionReport.regions[0])),
      message: /Duplicate execution region ID/,
    },
    {
      name: "negative rectangle width",
      mutate: (input) => { input.executionReport.regions[0].bounds!.width = -1; },
      message: /Invalid execution report/,
    },
    {
      name: "non-finite canvas dimension",
      mutate: (input) => { input.executionReport.canvas.width = Infinity; },
      message: /Invalid execution report|canvas.width must be a finite number/,
    },
    {
      name: "unknown region expectation",
      mutate: (input) => { (input.expectations.checks[0] as { avoidRegionIds: string[] }).avoidRegionIds = ["missing-region"]; },
      message: /unknown execution region/,
    },
    {
      name: "impossible safe area",
      mutate: (input) => { input.context.safeAreas!["short-vertical"].left = 1080; },
      message: /leaves no usable rectangle/,
    },
    {
      name: "duplicate composition state ID",
      mutate: (input) => input.executionReport.compositionStates.push(clone(input.executionReport.compositionStates[0])),
      message: /Duplicate execution composition state ID/,
    },
    {
      name: "unknown frame reference",
      mutate: (input) => { input.executionReport.compositionStates[0].frameReferenceId = "CF-99"; },
      message: /Unknown frameReferenceId/,
    },
    {
      name: "unknown state lineage ID",
      mutate: (input) => { input.executionReport.stateLineage[0].afterStateId = "missing-state"; },
      message: /Unknown afterStateId/,
    },
    {
      name: "unknown region binding",
      mutate: (input) => { input.executionReport.compositionStates[0].regionBindings.primarySubject = "missing-region"; },
      message: /Unknown region binding/,
    },
    {
      name: "E07 preserve mismatch",
      mutate: (input) => { (input.expectations.checks[2] as { preserveStateIds: string[] }).preserveStateIds = ["caption-current"]; },
      message: /does not match a selected CS-04 preserve binding/,
    },
  ];

  for (const { name, mutate, message } of cases) {
    const input = clone(await fixture());
    mutate(input);
    await assert.rejects(() => evaluate(input), (error: unknown) =>
      error instanceof EvaluatorInputError && message.test(error.message), name);
  }
});

test("execution reports reject editorial policy fields", async () => {
  const protectedRole = clone(await fixture());
  (protectedRole.executionReport.regions[0] as Record<string, unknown>).role = "protected-target";
  await assert.rejects(() => evaluate(protectedRole), /Invalid execution report/);

  const safeAreaFlag = clone(await fixture());
  (safeAreaFlag.executionReport.regions[0] as Record<string, unknown>).safeAreaRequired = true;
  await assert.rejects(() => evaluate(safeAreaFlag), /Invalid execution report/);
});

test("multiple expectations of one check produce independent results", async () => {
  const input = clone(await fixture());
  input.expectations.checks.push({
    id: "caption-avoids-caption",
    checkId: "E03",
    captionRegionId: "caption-main",
    avoidRegionIds: ["caption-main"],
  });

  const result = await evaluate(input);
  assert.equal(result.checks.length, 4);
  assert.equal(resultFor(result, "caption-avoids-guest").status, "fail");
  assert.equal(resultFor(result, "caption-avoids-caption").status, "fail");
});

test("existing Pattern Search, Pattern Handoff, and Composition Handoff remain optional evaluator-independent workflows", async () => {
  const patterns = await loadPatterns();
  assert.equal(searchPatternsV2(patterns, { intent: "数字を大きく" })[0]?.id, "VS-I05");
  const i05 = patterns.find((pattern) => pattern.id === "VS-I05");
  assert.ok(i05);
  assert.deepEqual(
    buildImplementationHandoff(i05, { suppliedValues: { valueId: "value-01", claimId: "claim-01" } }).inputs.unresolved,
    [],
  );

  const input = await fixture();
  const compositionCatalog = await loadCompositionCatalog();
  const handoff = buildSceneCompositionHandoff(compositionCatalog, input.selectedComposition);
  assert.equal(handoff.sequenceSelections[0].referenceId, "CS-04");
  assert.equal("evaluation" in handoff, false);
});
