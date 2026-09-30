import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadPatternDocuments, loadPatterns } from "../src/load.js";
import { validatePattern, validatePatternDocuments } from "../src/validate.js";

const patternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));

test("all three spike YAML files load", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  assert.equal(patterns.length, 3);
  assert.deepEqual(patterns.map((pattern) => pattern.id), ["VS-A03", "VS-T11", "VS-I04"]);
});

test("all three spike YAML files pass schema validation", async () => {
  const results = validatePatternDocuments(await loadPatternDocuments(patternsDirectory));
  assert.equal(results.length, 3);
  assert.deepEqual(results.filter((result) => !result.valid), []);
});

test("invalid evidence type fails", () => {
  const result = validatePattern({ id: "VS-X01", title: "Invalid evidence", category: "captions", purpose: ["test"], description: "test", goodFor: [], avoidWhen: [], tags: [], evidence: [{ type: "unsupported", confidence: 1, scope: ["id"] }] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field === "/evidence/0/type"));
});

test("missing required field fails", () => {
  const result = validatePattern({ id: "VS-X02", category: "captions", purpose: ["test"], description: "test", goodFor: [], avoidWhen: [], tags: [], evidence: [{ type: "proposal", confidence: 0.5, scope: ["id"] }] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field === "/title"));
});

test("invalid category fails", () => {
  const result = validatePattern({ id: "VS-X03", title: "Invalid category", category: "invalid", purpose: ["test"], description: "test", goodFor: [], avoidWhen: [], tags: [], evidence: [{ type: "proposal", confidence: 0.5, scope: ["id"] }] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field === "/category"));
});

test("observed evidence requires source metadata", () => {
  const result = validatePattern({ id: "VS-X04", title: "Missing source metadata", category: "captions", purpose: ["test"], goodFor: [], avoidWhen: [], tags: [], evidence: [{ type: "observed", confidence: 1, scope: ["title"] }] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field === "/evidence/0/source"));
});

test("observed evidence accepts source metadata without category or classification", () => {
  const result = validatePattern({ id: "VS-X05", title: "Minimal source metadata", category: "captions", purpose: ["test"], goodFor: [], avoidWhen: [], tags: [], evidence: [{ type: "observed", confidence: 1, scope: ["title"], source: { name: "External source", location: "Section 1" } }] });
  assert.equal(result.valid, true);
});

test("array-index evidence scope fails", () => {
  const result = validatePattern({ id: "VS-X06", title: "Indexed scope", category: "captions", purpose: ["test"], goodFor: [], avoidWhen: [], tags: [], evidence: [{ type: "proposal", confidence: 0.5, scope: ["tags[0]"] }] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field === "/evidence/0/scope/0"));
});

test("nonexistent evidence scope fails deterministic validation", () => {
  const result = validatePattern({ id: "VS-X07", title: "Misspelled scope", category: "captions", purpose: ["test"], goodFor: [], avoidWhen: [], tags: [], visual: { motion: { type: "scale" } }, evidence: [{ type: "proposal", confidence: 0.5, scope: ["visual.moiton"] }] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.keyword === "scopeExists" && error.field === "/evidence/0/scope/0"));
});
