import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { EditingPattern } from "../schema/pattern.js";
import {
  buildImplementationHandoff,
  buildSceneImplementationHandoff,
} from "../src/handoff.js";
import { loadPatterns } from "../src/load.js";

const patternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));
const tsxPath = fileURLToPath(new URL("../node_modules/.bin/tsx", import.meta.url));
const cliPath = fileURLToPath(new URL("../src/cli.ts", import.meta.url));

async function patternById(id: string): Promise<EditingPattern> {
  const pattern = (await loadPatterns(patternsDirectory)).find((candidate) => candidate.id === id);
  assert.ok(pattern, `Missing fixture Pattern: ${id}`);
  return pattern;
}

function handoffCli(...args: string[]) {
  return spawnSync(tsxPath, [cliPath, "handoff", ...args], { encoding: "utf8" });
}

test("current-contract handoff exposes grammar, declarations, and supplied values", async () => {
  const handoff = buildImplementationHandoff(await patternById("VS-I02"), {
    suppliedValues: { comparisonAxis: "price" },
  });

  assert.equal(handoff.status, "current-contract");
  assert.deepEqual(handoff.grammar?.visual?.layout, {
    type: "parallel comparison",
    position: "two comparable subjects aligned to shared criteria",
  });
  assert.deepEqual(handoff.grammar?.recipe, [
    "define two comparable subjects",
    "define a shared comparison axis",
    "render each criterion in stable correspondence",
  ]);
  assert.equal(handoff.inputs.declarations.subjectCount.kind, "constant");
  assert.equal(handoff.inputs.declarations.comparisonAxis.kind, "runtime-input");
  assert.deepEqual(handoff.inputs.suppliedValues, { comparisonAxis: "price" });
  assert.deepEqual(handoff.inputs.unresolved, []);
});

test("required runtime inputs remain unresolved until supplied", async () => {
  const handoff = buildImplementationHandoff(await patternById("VS-I02"));
  assert.deepEqual(handoff.inputs.unresolved, ["comparisonAxis"]);
});

test("optional context input remains resolved when absent", async () => {
  const handoff = buildImplementationHandoff(await patternById("VS-S03"), {
    suppliedValues: { primarySource: "speaker", secondarySource: "demo" },
  });
  assert.deepEqual(handoff.inputs.unresolved, []);
});

test("required context input remains unresolved and is not satisfied by passthrough context", async () => {
  const handoff = buildImplementationHandoff(await patternById("VS-S01"), {
    context: { platform: { safeAreaProfile: { top: 10 } } },
  });
  assert.deepEqual(handoff.inputs.unresolved, ["safeAreaProfile"]);
  assert.deepEqual(handoff.context, { platform: { safeAreaProfile: { top: 10 } } });
});

test("constants neither become unresolved nor accept caller overrides", async () => {
  const pattern = await patternById("VS-I02");
  assert.deepEqual(buildImplementationHandoff(pattern).inputs.unresolved, ["comparisonAxis"]);
  assert.throws(
    () => buildImplementationHandoff(pattern, { suppliedValues: { subjectCount: 3 } }),
    /Cannot override constant parameter: subjectCount/,
  );
});

test("handoff rejects unknown supplied parameters", async () => {
  const pattern = await patternById("VS-I02");
  assert.throws(
    () => buildImplementationHandoff(pattern, { suppliedValues: { unknown: "value" } }),
    /Unknown supplied parameter: unknown/,
  );
});

test("handoff rejects mismatched supplied value types", async () => {
  const i02 = await patternById("VS-I02");
  const g08 = await patternById("VS-G08");
  const g02 = await patternById("VS-G02");

  assert.throws(() => buildImplementationHandoff(i02, { suppliedValues: { comparisonAxis: 2 } }), /expected string/);
  assert.throws(() => buildImplementationHandoff(g08, { suppliedValues: { progressValue: "2" } }), /expected number/);
  assert.throws(() => buildImplementationHandoff(g02, { suppliedValues: { participantSet: {} } }), /expected array/);
  assert.throws(() => buildImplementationHandoff(g02, { suppliedValues: { scoreState: [] } }), /expected object/);
});

test("current-contract Pattern without parameters produces empty inputs", async () => {
  const handoff = buildImplementationHandoff(await patternById("VS-E09"));
  assert.equal(handoff.status, "current-contract");
  assert.ok(handoff.grammar);
  assert.deepEqual(handoff.inputs, { declarations: {}, suppliedValues: {}, unresolved: [] });
});

test("semantic-only handoff remains valid without invented execution data", async () => {
  const pattern = await patternById("VS-B04");
  const handoff = buildImplementationHandoff(pattern);
  assert.equal(handoff.status, "semantic-only");
  assert.equal(handoff.grammar, null);
  assert.deepEqual(handoff.inputs, { declarations: {}, suppliedValues: {}, unresolved: [] });
  assert.deepEqual(handoff.provenance.implementationEvidence, []);
  assert.throws(() => buildImplementationHandoff(pattern, { suppliedValues: { style: "comic" } }), /Unknown supplied parameter: style/);
});

test("historical default projections omit renderer and Taste metadata", async () => {
  const t11 = buildImplementationHandoff(await patternById("VS-T11"));
  assert.equal(t11.status, "historical-exception");
  assert.deepEqual(t11.grammar, {
    visual: { motion: { type: "scale", trigger: "keyword" } },
    recipe: ["Mark the keyword within the caption token sequence.", "Apply the scale motion only to the marked keyword."],
  });
  assert.equal("historicalMetadata" in t11, false);

  const i04 = buildImplementationHandoff(await patternById("VS-I04"));
  assert.deepEqual(i04.grammar, {
    visual: { layout: { type: "relationship-diagram" } },
    recipe: ["Represent each concept as a labeled node.", "Connect nodes with labeled directional relationships."],
  });

  const a03 = buildImplementationHandoff(await patternById("VS-A03"));
  assert.deepEqual(a03.grammar, {
    audio: { type: "silence", cue: "contrast", sync: "edit-point", notes: "Pause or stop the music bed at the chosen edit point." },
    timing: { trigger: "edit-point", duration: "context-dependent pause" },
    recipe: ["Identify the edit point that needs contrast or space.", "Mute or stop the music bed for the selected pause."],
  });
});

test("historical metadata opt-in preserves excluded values without changing portable grammar", async () => {
  const t11Pattern = await patternById("VS-T11");
  const t11Default = buildImplementationHandoff(t11Pattern);
  const t11 = buildImplementationHandoff(t11Pattern, { includeHistoricalMetadata: true });
  assert.deepEqual(t11.historicalMetadata, {
    visual: { motion: { durationFrames: [6, 12], easing: "easeOutCubic", parameters: { fromScale: 1.0, peakScale: 1.12 } } },
    rendererCandidates: ["remotion", "hyperframes"],
  });
  assert.deepEqual(t11.grammar, t11Default.grammar);

  const i04 = buildImplementationHandoff(await patternById("VS-I04"), { includeHistoricalMetadata: true });
  assert.deepEqual(i04.historicalMetadata, {
    visual: { layout: { position: "center", safeArea: "title-safe" } },
    rendererCandidates: ["remotion", "hyperframes"],
  });

  const a03 = buildImplementationHandoff(await patternById("VS-A03"), { includeHistoricalMetadata: true });
  assert.deepEqual(a03.historicalMetadata, {
    audio: { optional: false },
    rendererCandidates: ["ffmpeg", "hyperframes"],
  });
  assert.deepEqual(a03.grammar?.audio, { type: "silence", cue: "contrast", sync: "edit-point", notes: "Pause or stop the music bed at the chosen edit point." });
});

test("implementation proposal evidence is preserved and source Pattern data is not mutated", async () => {
  const pattern = await patternById("VS-I02");
  const original = structuredClone(pattern);
  const handoff = buildImplementationHandoff(pattern, { suppliedValues: { comparisonAxis: "price" } });

  assert.deepEqual(handoff.provenance.implementationEvidence, pattern.evidence.filter((entry) => entry.scope.some((scope) => scope === "visual" || scope.startsWith("visual.") || scope === "audio" || scope.startsWith("audio.") || scope === "timing" || scope.startsWith("timing.") || scope === "implementation" || scope.startsWith("implementation."))));
  const layout = handoff.grammar?.visual?.layout;
  assert.ok(layout);
  layout.type = "changed";
  handoff.inputs.declarations.comparisonAxis.description = "changed";
  assert.deepEqual(pattern, original);
});

test("scene handoff preserves selection order, duplicates, and shared context", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  const context = { scene: { sceneId: "scene-1" }, platform: { aspectRatio: "9:16" } };
  const handoff = buildSceneImplementationHandoff(patterns, [
    { patternId: "VS-I02", suppliedValues: { comparisonAxis: "price" } },
    { patternId: "VS-A01" },
    { patternId: "VS-I02", suppliedValues: { comparisonAxis: "speed" } },
  ], context);

  assert.deepEqual(handoff.patterns.map((entry) => entry.pattern.id), ["VS-I02", "VS-A01", "VS-I02"]);
  assert.deepEqual(handoff.context, context);
  assert.deepEqual(handoff.patterns.map((entry) => entry.context), [context, context, context]);
});

test("scene handoff fails clearly for missing IDs and does not infer shared inputs", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  assert.throws(
    () => buildSceneImplementationHandoff(patterns, [{ patternId: "VS-NOT-FOUND" }]),
    /Pattern not found: VS-NOT-FOUND/,
  );

  const handoff = buildSceneImplementationHandoff(patterns, [
    { patternId: "VS-I05", suppliedValues: { valueId: "value-1" } },
    { patternId: "VS-R01", suppliedValues: { emphasisTarget: "value-1" } },
  ]);
  assert.deepEqual(handoff.patterns[0].inputs.unresolved, ["claimId"]);
  assert.deepEqual(handoff.patterns[1].inputs.unresolved, []);
});

test("handoff CLI emits machine-readable JSON", () => {
  const result = handoffCli("VS-I02", "--values", '{"comparisonAxis":"price"}');
  assert.equal(result.status, 0, result.stderr);
  const handoff = JSON.parse(result.stdout) as { pattern: { id: string }; inputs: { unresolved: string[] } };
  assert.equal(handoff.pattern.id, "VS-I02");
  assert.deepEqual(handoff.inputs.unresolved, []);
});

test("handoff CLI rejects invalid values and context objects", () => {
  const invalidValues = handoffCli("VS-I02", "--values", "[]");
  assert.notEqual(invalidValues.status, 0);
  assert.match(invalidValues.stderr, /--values must be a JSON object/);

  const malformedValues = handoffCli("VS-I02", "--values", "{");
  assert.notEqual(malformedValues.status, 0);
  assert.match(malformedValues.stderr, /--values must be valid JSON/);

  const invalidContext = handoffCli("VS-I02", "--context", '{"unknown":{}}');
  assert.notEqual(invalidContext.status, 0);
  assert.match(invalidContext.stderr, /Unknown context key: unknown/);

  const invalidContextValue = handoffCli("VS-I02", "--context", '{"platform":[]}');
  assert.notEqual(invalidContextValue.status, 0);
  assert.match(invalidContextValue.stderr, /Context platform must be a JSON object/);
});
