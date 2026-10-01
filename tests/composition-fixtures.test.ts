import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { loadPatterns } from "../src/load.js";

type Evidence = { evidence_type: string; source_ids: string[]; observation_ids: string[] };
type FrameReference = { id: string; evidence: Evidence; renderer_unresolved: string[] };
type SequenceReference = {
  id: string;
  research_relation: string;
  preserve: string[];
  change: string[];
  release: string[];
  restore: string;
  mandatory_cut: boolean;
  evidence: Evidence;
  renderer_unresolved: string[];
};
type SceneFixture = { scene_id: string; selected_pattern_ids: string[]; frame_reference_ids: string[]; sequence_reference_ids: string[]; must_not_infer: string[] };

const root = new URL("../", import.meta.url);
const fixtureUrl = (name: string) => new URL(`research/composition/fixtures/${name}`, root);

async function yaml<T>(url: URL): Promise<T> {
  const document = parseDocument(await readFile(url, "utf8"), { prettyErrors: true, uniqueKeys: true });
  assert.equal(document.errors.length, 0, document.errors.map((error) => error.message).join("\n"));
  return document.toJS() as T;
}

function unique(values: string[], label: string): void {
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

function walk(value: unknown, visit: (key: string, value: unknown) => void): void {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
  } else if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      visit(key, child);
      walk(child, visit);
    }
  }
}

test("composition fixture spike stays linked to the researched catalog without becoming production data", async () => {
  const [framesDoc, sequencesDoc, scenesDoc, sourcesDoc, observationsDoc] = await Promise.all([
    yaml<{ frame_references: FrameReference[] }>(fixtureUrl("frame-references.yaml")),
    yaml<{ sequence_references: SequenceReference[] }>(fixtureUrl("sequence-references.yaml")),
    yaml<{ scene_fixtures: SceneFixture[] }>(fixtureUrl("scene-fixtures.yaml")),
    yaml<{ sources: { source_id: string; verification?: string }[] }>(new URL("research/composition/sources.yaml", root)),
    yaml<{ observations: { observation_id: string; source_id: string }[] }>(new URL("research/composition/observations.yaml", root)),
  ]);
  const frames = framesDoc.frame_references;
  const sequences = sequencesDoc.sequence_references;
  const scenes = scenesDoc.scene_fixtures;
  const sourcesById = new Map(sourcesDoc.sources.map((source) => [source.source_id, source]));
  const observationsById = new Map(observationsDoc.observations.map((observation) => [observation.observation_id, observation]));
  const frameIds = new Set(frames.map(({ id }) => id));
  const sequenceIds = new Set(sequences.map(({ id }) => id));
  const patternIds = new Set((await loadPatterns(fileURLToPath(new URL("patterns/", root)))).map(({ id }) => id));

  assert.deepEqual(frames.map(({ id }) => id), ["CF-01", "CF-02", "CF-03", "CF-04", "CF-05", "CF-06"]);
  assert.deepEqual(sequences.map(({ id }) => id), ["CS-01", "CS-02", "CS-03", "CS-04"]);
  assert.ok(scenes.length >= 5);
  unique(frames.map(({ id }) => id), "Frame IDs");
  unique(sequences.map(({ id }) => id), "Sequence IDs");
  unique(scenes.map(({ scene_id }) => scene_id), "Scene IDs");

  for (const reference of [...frames, ...sequences]) {
    assert.equal(reference.evidence.evidence_type, "inferred");
    assert.ok(new Set(reference.evidence.source_ids).size >= 2, `${reference.id} needs at least two sources`);
    for (const sourceId of reference.evidence.source_ids) {
      const source = sourcesById.get(sourceId);
      assert.ok(source, `${reference.id}: unknown source ${sourceId}`);
      assert.equal(source.verification, "visually_verified", `${reference.id}: evidence source ${sourceId} must be visually verified`);
    }
    for (const observationId of reference.evidence.observation_ids) {
      const observation = observationsById.get(observationId);
      assert.ok(observation, `${reference.id}: unknown observation ${observationId}`);
      assert.ok(reference.evidence.source_ids.includes(observation.source_id), `${reference.id}: observation ${observationId} is outside its evidence sources`);
    }
  }

  assert.deepEqual(sequences.map(({ research_relation }) => research_relation).sort(), ["Q01", "Q03", "Q04", "Q12"]);
  assert.ok(sequences.some(({ preserve }) => preserve.length > 0));
  assert.ok(sequences.some(({ release }) => release.length > 0));
  assert.ok(sequences.some(({ restore }) => restore.length > 0));
  assert.ok(sequences.every(({ mandatory_cut }) => mandatory_cut === false));
  const hold = sequences.find(({ id }) => id === "CS-04");
  assert.ok(hold);
  assert.ok(hold.change.includes("text content or text priority"));
  assert.ok(hold.preserve.includes("baseline framing"));

  for (const scene of scenes) {
    assert.ok(scene.must_not_infer.length > 0, `${scene.scene_id}: must_not_infer is required`);
    for (const patternId of scene.selected_pattern_ids) assert.ok(patternIds.has(patternId), `${scene.scene_id}: unknown Pattern ${patternId}`);
    for (const frameId of scene.frame_reference_ids) assert.ok(frameIds.has(frameId), `${scene.scene_id}: unknown Frame reference ${frameId}`);
    for (const sequenceId of scene.sequence_reference_ids) assert.ok(sequenceIds.has(sequenceId), `${scene.scene_id}: unknown Sequence reference ${sequenceId}`);
  }
});

test("composition fixture spike contains no renderer geometry or renderer binding fields", async () => {
  const docs = await Promise.all([
    yaml<unknown>(fixtureUrl("frame-references.yaml")),
    yaml<unknown>(fixtureUrl("sequence-references.yaml")),
    yaml<unknown>(fixtureUrl("scene-fixtures.yaml")),
  ]);
  const forbiddenKeys = new Set(["x", "y", "width", "height", "px", "fontSize", "scale", "cropPercent", "durationFrames", "easing"]);
  const rendererNames = /\b(remotion|ffmpeg|after-effects)\b/i;
  for (const document of docs) {
    walk(document, (key, value) => {
      assert.ok(!forbiddenKeys.has(key), `forbidden geometry field: ${key}`);
      if (typeof value === "string") assert.ok(!rendererNames.test(value), `renderer binding leaked into fixture: ${value}`);
    });
  }
});
