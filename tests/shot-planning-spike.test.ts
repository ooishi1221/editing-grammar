import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseDocument } from "yaml";
import { loadCompositionCatalog } from "../src/composition.js";
import { loadPatterns } from "../src/load.js";

type SourceRange = { startMs: number; endMs: number };
type SemanticBeat = { id: string; meaning: string; sourceRange?: SourceRange };
type SemanticScene = { sceneId: string; beats: SemanticBeat[] };
type ShotDecision = "establish" | "hold" | "switch" | "insert" | "return";
type ShotPlanStep = {
  id: string;
  beatId: string;
  decision: ShotDecision;
  rationale: string;
  patternIds?: string[];
  frameReferenceId?: string;
  sequenceReferenceId?: string;
  returnToStepId?: string;
};
type ShotPlan = { planId: string; sceneId: string; steps: ShotPlanStep[] };

const root = new URL("../", import.meta.url);
const names = ["reaction", "numeric-reveal", "supporting-material"] as const;

async function yaml<T>(path: string): Promise<T> {
  const document = parseDocument(await readFile(new URL(path, root), "utf8"), {
    prettyErrors: true,
    uniqueKeys: true,
  });
  assert.equal(document.errors.length, 0, document.errors.map((error) => error.message).join("\n"));
  return document.toJS() as T;
}

async function loadSpike() {
  const entries = await Promise.all(names.map(async (name) => ({
    name,
    scene: await yaml<SemanticScene>(`examples/shot-planning-spike/fixtures/${name}.yaml`),
    plan: await yaml<ShotPlan>(`examples/shot-planning-spike/plans/${name}-plan.yaml`),
  })));
  return entries;
}

test("shot-planning fixtures reference existing beats and existing Editing Grammar IDs in beat order", async () => {
  const [entries, patterns, catalog] = await Promise.all([loadSpike(), loadPatterns(), loadCompositionCatalog()]);
  const patternIds = new Set(patterns.map((pattern) => pattern.id));
  const frameIds = new Set(catalog.frameReferences.map((reference) => reference.id));
  const sequenceIds = new Set(catalog.sequenceReferences.map((reference) => reference.id));

  for (const { scene, plan } of entries) {
    assert.equal(plan.sceneId, scene.sceneId);
    assert.equal(new Set(plan.steps.map((step) => step.id)).size, plan.steps.length);
    const beatOrder = new Map(scene.beats.map((beat, index) => [beat.id, index]));
    let previousBeat = -1;
    for (const step of plan.steps) {
      const beatIndex = beatOrder.get(step.beatId);
      assert.notEqual(beatIndex, undefined, `${plan.planId}: unknown beat ${step.beatId}`);
      assert.ok(beatIndex! > previousBeat, `${plan.planId}: steps must follow authored beat order`);
      previousBeat = beatIndex!;
      assert.ok(step.rationale.trim().length > 0, `${plan.planId}.${step.id}: rationale`);
      for (const patternId of step.patternIds ?? []) assert.ok(patternIds.has(patternId), `${plan.planId}: Pattern ${patternId}`);
      if (step.frameReferenceId) assert.ok(frameIds.has(step.frameReferenceId), `${plan.planId}: Frame ${step.frameReferenceId}`);
      if (step.sequenceReferenceId) assert.ok(sequenceIds.has(step.sequenceReferenceId), `${plan.planId}: Sequence ${step.sequenceReferenceId}`);
      if (["establish", "switch", "insert"].includes(step.decision)) assert.ok(step.frameReferenceId, `${plan.planId}.${step.id}: visual state`);
      if (step.decision === "return") {
        assert.ok(step.returnToStepId, `${plan.planId}.${step.id}: return target`);
        const returned = plan.steps.find((candidate) => candidate.id === step.returnToStepId);
        assert.ok(returned && plan.steps.indexOf(returned) < plan.steps.indexOf(step), `${plan.planId}.${step.id}: earlier return target`);
      }
    }
  }
});

test("reaction plan expresses two justified changes across four beats and preserves supplied source ranges", async () => {
  const { scene, plan } = (await loadSpike()).find((entry) => entry.name === "reaction")!;
  assert.equal(scene.beats.length, 4);
  assert.deepEqual(scene.beats.map((beat) => beat.sourceRange), [
    { startMs: 0, endMs: 2100 },
    { startMs: 2100, endMs: 3400 },
    { startMs: 3400, endMs: 5000 },
    { startMs: 5000, endMs: 6500 },
  ]);
  assert.deepEqual(plan.steps.map((step) => step.decision), ["establish", "switch", "return", "hold"]);
  assert.equal(plan.steps.filter((step) => step.decision === "switch" || step.decision === "return" || step.decision === "insert").length, 2);
  assert.equal(plan.steps.at(-1)?.sequenceReferenceId, "CS-04");
  assert.equal(plan.steps.some((step) => "sourceRange" in step || "startMs" in step || "endMs" in step), false);
});

test("numeric reveal plan makes HOLD explicit without inventing timing", async () => {
  const { scene, plan } = (await loadSpike()).find((entry) => entry.name === "numeric-reveal")!;
  assert.equal(scene.beats.every((beat) => beat.sourceRange === undefined), true);
  assert.deepEqual(plan.steps.map((step) => step.decision), ["establish", "switch", "hold", "hold"]);
  assert.deepEqual(plan.steps.filter((step) => step.decision === "hold").map((step) => step.sequenceReferenceId), ["CS-04", "CS-04"]);
  assert.deepEqual(plan.steps[1].patternIds, ["VS-I05"]);
  assert.equal(plan.steps.some((step) => ["startMs", "endMs", "duration", "durationMs", "frames"].some((key) => key in step)), false);
});

test("supporting material plan represents an authored insert and explicit return", async () => {
  const { plan } = (await loadSpike()).find((entry) => entry.name === "supporting-material")!;
  assert.deepEqual(plan.steps.map((step) => step.decision), ["establish", "insert", "return"]);
  assert.deepEqual(plan.steps[1].patternIds, ["VS-L03"]);
  assert.equal(plan.steps[1].frameReferenceId, "CF-04");
  assert.equal(plan.steps[1].sequenceReferenceId, "CS-02");
  assert.equal(plan.steps[2].returnToStepId, "step-01");
  assert.equal(plan.steps[2].sequenceReferenceId, "CS-02");
});

test("shot plans remain semantic and contain no renderer geometry or transition effects", async () => {
  const entries = await loadSpike();
  const prohibited = new Set([
    "x", "y", "width", "height", "scale", "crop", "easing", "transition", "duration", "durationMs", "frames", "startMs", "endMs",
  ]);
  for (const { plan } of entries) {
    for (const step of plan.steps) {
      for (const key of Object.keys(step)) assert.equal(prohibited.has(key), false, `${plan.planId}.${step.id}: ${key}`);
    }
  }
});
