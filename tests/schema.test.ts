import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadPatternDocuments, loadPatterns } from "../src/load.js";
import { validatePattern, validatePatternDocuments } from "../src/validate.js";

const patternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));
const sourceAuditPath = new URL("../docs/source-audit.md", import.meta.url);

async function auditedIds(): Promise<string[]> {
  const sourceAudit = await readFile(sourceAuditPath, "utf8");
  return [...sourceAudit.matchAll(/^\| (VS-[A-Z]\d{2}) \|/gm)].map((match) => match[1]);
}

test("all audited YAML files load with no missing or extra IDs", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  const auditIds = await auditedIds();
  const patternIds = patterns.map((pattern) => pattern.id);

  assert.equal(patterns.length, 92);
  assert.equal(new Set(patternIds).size, 92);
  assert.deepEqual([...patternIds].sort(), [...auditIds].sort());
});

test("all audited YAML files pass schema validation", async () => {
  const results = validatePatternDocuments(await loadPatternDocuments(patternsDirectory));
  assert.equal(results.length, 92);
  assert.deepEqual(results.filter((result) => !result.valid), []);
});

test("loaded YAML files have the expected OSS category distribution", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  const counts = Object.fromEntries(
    [...new Set(patterns.map((pattern) => pattern.category))].map((category) => [
      category,
      patterns.filter((pattern) => pattern.category === category).length,
    ]),
  );

  assert.deepEqual(counts, {
    audio: 8,
    branding: 6,
    captions: 14,
    game_ui: 8,
    information: 14,
    layout: 10,
    reactions: 12,
    retention: 6,
    shorts: 4,
    transitions: 10,
  });
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
