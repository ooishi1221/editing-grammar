import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseDocument } from "yaml";
import type { SceneCompositionInput } from "../schema/composition.js";
import type { SemanticScene, ShotPlan } from "../schema/shot-plan.schema.js";
import { buildSceneCompositionHandoff, loadCompositionCatalog } from "../src/composition.js";
import { loadPatterns } from "../src/load.js";
import { buildShotPlanHandoff, ShotPlanValidationError } from "../src/shot-plan.js";

interface ShotPlanFixture {
  scene: SemanticScene;
  selectedComposition: SceneCompositionInput;
  plan: ShotPlan;
}

const root = new URL("../", import.meta.url);

async function fixture(name = "reaction"): Promise<ShotPlanFixture> {
  const document = parseDocument(
    await readFile(new URL(`tests/fixtures/shot-plan/${name}.yaml`, root), "utf8"),
    { prettyErrors: true, uniqueKeys: true },
  );
  assert.equal(document.errors.length, 0, document.errors.map((error) => error.message).join("\n"));
  return document.toJS() as ShotPlanFixture;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

async function build(suppliedInput?: ShotPlanFixture) {
  const input = suppliedInput ?? await fixture();
  const [patterns, catalog] = await Promise.all([loadPatterns(), loadCompositionCatalog()]);
  return buildShotPlanHandoff({
    patterns,
    composition: buildSceneCompositionHandoff(catalog, input.selectedComposition),
    scene: input.scene,
    plan: input.plan,
  });
}

async function assertPlanError(mutate: (input: ShotPlanFixture) => void, message: RegExp) {
  const input = clone(await fixture());
  mutate(input);
  await assert.rejects(() => build(input), (error: unknown) => error instanceof ShotPlanValidationError && message.test(error.message));
}

test("reaction Shot Plan resolves a baseline return and explicit CS-04 HOLD without overcutting", async () => {
  const handoff = await build();
  assert.deepEqual(handoff.steps.map((step) => [step.decision, step.resolvedFrameSelectionId]), [
    ["establish", "baseline"],
    ["switch", "guest-reaction"],
    ["return", "baseline"],
    ["hold", "baseline"],
  ]);
  assert.equal(handoff.steps.filter((step) => ["switch", "insert", "return"].includes(step.decision)).length, 2);
  assert.equal(handoff.steps[3]?.sequenceSelectionId, "conversation-hold");
  assert.equal("startMs" in handoff.steps[0]!, false);
  assert.equal("sourceRange" in handoff.steps[0]!, false);
});

test("numeric reveal uses VS-I05 and holds the actual CF-05 selection without invented timing", async () => {
  const input = await fixture("numeric-reveal");
  const before = clone(input.scene);
  const handoff = await build(input);
  assert.deepEqual(handoff.steps.map((step) => [step.decision, step.resolvedFrameSelectionId]), [
    ["establish", "speaker-context"],
    ["switch", "numeric-priority"],
    ["hold", "numeric-priority"],
    ["hold", "numeric-priority"],
  ]);
  assert.deepEqual(handoff.steps[1]?.patternIds, ["VS-I05"]);
  assert.deepEqual(input.scene, before);
  assert.equal(input.scene.beats.every((beat) => beat.sourceRange === undefined), true);
});

test("supporting-material Shot Plan resolves the temporary insert back to speaker context", async () => {
  const handoff = await build(await fixture("supporting-material"));
  assert.deepEqual(handoff.steps.map((step) => [step.decision, step.resolvedFrameSelectionId]), [
    ["establish", "speaker-context"],
    ["insert", "material-support"],
    ["return", "speaker-context"],
  ]);
  assert.deepEqual(handoff.steps[1]?.patternIds, ["VS-L03"]);
  assert.equal(handoff.steps[1]?.sequenceSelectionId, "support-cycle");
  assert.equal(handoff.steps[2]?.returnToStepId, "step-01");
});

test("stable authored sequence selection IDs preserve backwards compatibility and address same-reference instances", async () => {
  const catalog = await loadCompositionCatalog();
  const oldInput: SceneCompositionInput = {
    frameSelections: [{ id: "baseline", referenceId: "CF-01", targetBindings: { contextSubjects: "host-and-guest" }, textStateIds: [] }],
    textStates: [],
    sequenceSelections: [{
      referenceId: "CS-01",
      stateBindings: { preserve: ["baseline"], change: [], release: [], restore: ["baseline"] },
    }],
  };
  assert.equal(buildSceneCompositionHandoff(catalog, oldInput).sequenceSelections[0]?.id, undefined);

  const input = await fixture();
  input.selectedComposition.sequenceSelections.push({
    id: "reaction-cycle-secondary",
    referenceId: "CS-01",
    stateBindings: { preserve: ["baseline"], change: ["guest-reaction"], release: [], restore: ["baseline"] },
  });
  const handoff = await build(input);
  assert.equal(handoff.steps[1]?.sequenceSelectionId, "reaction-cycle");
});

test("Shot Plan builder does not mutate inputs and deep-copies resolved output", async () => {
  const input = await fixture();
  const before = clone(input);
  const handoff = await build(input);
  assert.deepEqual(input, before);
  handoff.steps[1]!.patternIds!.push("VS-I05");
  handoff.steps[0]!.resolvedFrameSelectionId = "mutated";
  assert.deepEqual(input, before);
});

test("Shot Plan rejects invalid beat coverage, ordering, establishes, and scene identity", async () => {
  await assertPlanError((input) => { input.plan.steps[1]!.beatId = "missing-beat"; }, /Unknown beatId/);
  await assertPlanError((input) => { input.plan.steps[1]!.beatId = "beat-01"; }, /Duplicate shot plan beat reference/);
  await assertPlanError((input) => { input.plan.steps.pop(); }, /exactly one step/);
  await assertPlanError((input) => { input.plan.steps[1]!.beatId = "beat-03"; input.plan.steps[2]!.beatId = "beat-02"; }, /step order/);
  await assertPlanError((input) => { input.plan.steps[0]!.decision = "switch"; }, /First Shot Plan step must be establish/);
  await assertPlanError((input) => { input.plan.steps[1]!.decision = "establish"; }, /exactly one establish/);
  await assertPlanError((input) => { input.plan.sceneId = "another-scene"; }, /sceneId does not match/);
});

test("Shot Plan rejects unknown and duplicate selection, Pattern, and step references", async () => {
  await assertPlanError((input) => { input.plan.steps[1]!.id = "step-01"; }, /Duplicate shot plan step ID/);
  await assertPlanError((input) => { input.plan.steps[1]!.patternIds = ["VS-XX"]; }, /Unknown Pattern ID/);
  await assertPlanError((input) => { input.plan.steps[1]!.frameSelectionId = "missing-frame"; }, /Unknown frameSelectionId/);
  await assertPlanError((input) => { input.plan.steps[1]!.sequenceSelectionId = "missing-sequence"; }, /Unknown sequenceSelectionId/);

  const input = clone(await fixture());
  input.selectedComposition.sequenceSelections[1]!.id = "reaction-cycle";
  const catalog = await loadCompositionCatalog();
  assert.throws(
    () => buildSceneCompositionHandoff(catalog, input.selectedComposition),
    /Duplicate sequence selection ID: reaction-cycle/,
  );
});

test("Shot Plan enforces return and HOLD semantics against selected sequence instances", async () => {
  await assertPlanError((input) => { delete input.plan.steps[2]!.returnToStepId; }, /return step step-03 requires returnToStepId/);
  await assertPlanError((input) => { input.plan.steps[2]!.returnToStepId = "step-04"; }, /must reference an earlier plan step/);
  await assertPlanError((input) => { input.plan.steps[3]!.sequenceSelectionId = "reaction-cycle"; }, /must reference a selected CS-04/);
  await assertPlanError((input) => { delete input.plan.steps[3]!.sequenceSelectionId; }, /requires sequenceSelectionId/);
});

test("Shot Plan rejects malformed source ranges without turning them into timing estimates", async () => {
  await assertPlanError((input) => { input.scene.beats[0]!.sourceRange!.endMs = 0; }, /must end after it starts/);
  await assertPlanError((input) => { input.scene.beats[0]!.sourceRange!.startMs = Number.NaN; }, /Invalid semantic scene|finite milliseconds/);
});
