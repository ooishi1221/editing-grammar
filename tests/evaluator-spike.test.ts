import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseDocument } from "yaml";
import type { SceneCompositionInput } from "../schema/composition.js";
import {
  evaluateSceneComposition,
  type EvaluationCheck,
  type NormalizedExecutionReport,
} from "../examples/evaluator-spike/evaluate.js";
import {
  buildSceneCompositionHandoff,
  loadCompositionCatalog,
} from "../src/composition.js";

interface EvaluatorFixture {
  selectedComposition: SceneCompositionInput;
  executionReport: NormalizedExecutionReport;
}

const root = new URL("../", import.meta.url);

async function fixture(): Promise<EvaluatorFixture> {
  const document = parseDocument(
    await readFile(new URL("examples/evaluator-spike/fixtures/vertical-short-mixed.yaml", root), "utf8"),
    { prettyErrors: true, uniqueKeys: true },
  );
  assert.equal(document.errors.length, 0, document.errors.map((error) => error.message).join("\n"));
  return document.toJS() as EvaluatorFixture;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function check(result: { checks: EvaluationCheck[] }, id: EvaluationCheck["id"]): EvaluationCheck {
  const selected = result.checks.find((candidate) => candidate.id === id);
  assert.ok(selected, `missing ${id}`);
  return selected;
}

async function evaluate(input: EvaluatorFixture) {
  const catalog = await loadCompositionCatalog();
  const selectedComposition = buildSceneCompositionHandoff(catalog, input.selectedComposition);
  return evaluateSceneComposition(selectedComposition, input.executionReport);
}

test("canonical vertical fixture reports a caption collision while safe area and HOLD pass", async () => {
  const result = await evaluate(await fixture());

  assert.equal(check(result, "E03").status, "fail");
  assert.deepEqual(check(result, "E03").evidence, {
    captionRegionId: "caption-main",
    protectedRegionId: "guest-face",
    intersection: { x: 360, y: 1100, width: 300, height: 120, area: 36000 },
  });
  assert.equal(check(result, "E05").status, "pass");
  assert.equal(check(result, "E07").status, "pass");
  assert.equal(result.hasFailures, true);
});

test("E03 passes when the caption moves away from the protected target", async () => {
  const input = clone(await fixture());
  const caption = input.executionReport.regions?.find((region) => region.id === "caption-main");
  assert.ok(caption?.bounds);
  caption.bounds = { ...caption.bounds, x: 60, y: 200 };

  assert.equal(check(await evaluate(input), "E03").status, "pass");
});

test("E03 skips when protected-target metadata is unavailable", async () => {
  const input = clone(await fixture());
  input.executionReport.regions = input.executionReport.regions?.filter((region) => region.role !== "protected-target");

  assert.equal(check(await evaluate(input), "E03").status, "skipped");
});

test("E05 fails when a required region moves outside the supplied safe area", async () => {
  const input = clone(await fixture());
  const caption = input.executionReport.regions?.find((region) => region.id === "caption-main");
  assert.ok(caption?.bounds);
  caption.bounds = { ...caption.bounds, x: 0 };

  assert.equal(check(await evaluate(input), "E05").status, "fail");
});

test("E05 skips when platform safe-area metadata is unavailable", async () => {
  const input = clone(await fixture());
  input.executionReport.platformSafeArea = undefined;

  assert.equal(check(await evaluate(input), "E05").status, "skipped");
});

test("E07 fails when a CS-04 HOLD signature changes", async () => {
  const input = clone(await fixture());
  const after = input.executionReport.compositionStates?.find((state) => state.stateId === "after");
  assert.ok(after);
  after.frameRef = "CF-01";

  assert.equal(check(await evaluate(input), "E07").status, "fail");
});

test("E07 skips without CS-04 or with a missing HOLD comparison state", async () => {
  const withoutHold = clone(await fixture());
  withoutHold.selectedComposition.sequenceSelections = [];
  assert.equal(check(await evaluate(withoutHold), "E07").status, "skipped");

  const missingState = clone(await fixture());
  missingState.executionReport.compositionStates = missingState.executionReport.compositionStates?.filter(
    (state) => state.stateId !== "after",
  );
  assert.equal(check(await evaluate(missingState), "E07").status, "skipped");
});
