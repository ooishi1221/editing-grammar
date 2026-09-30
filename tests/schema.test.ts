import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadPatternDocuments, loadPatterns } from "../src/load.js";
import { validatePattern, validatePatternDocuments } from "../src/validate.js";

const patternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));
const sourceAuditPath = new URL("../docs/source-audit.md", import.meta.url);

const sourceCategoryMapping = {
  "発話テロップ": "captions",
  "強調・リアクション": "reactions",
  "情報・解説": "information",
  "レイアウト": "layout",
  "テンポ・遷移": "transitions",
  "音": "audio",
  "企画進行UI": "game_ui",
  "ブランド・装飾": "branding",
  "視聴維持・CTA": "retention",
  "Shorts特化": "shorts",
} as const;

type SourceCategory = keyof typeof sourceCategoryMapping;

interface AuditEntry {
  id: string;
  title: string;
  purpose: string;
  sourceCategory: SourceCategory;
  classification: string;
}

async function auditedEntries(): Promise<AuditEntry[]> {
  const sourceAudit = await readFile(sourceAuditPath, "utf8");
  const entries: AuditEntry[] = [];
  let sourceCategory: SourceCategory | undefined;

  for (const line of sourceAudit.split("\n")) {
    const categoryMatch = line.match(/^### (.+) \(\d+\)$/);
    if (categoryMatch && categoryMatch[1] in sourceCategoryMapping) {
      sourceCategory = categoryMatch[1] as SourceCategory;
      continue;
    }

    const rowMatch = line.match(/^\| (VS-[A-Z]\d{2}) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/);
    if (rowMatch) {
      assert.ok(sourceCategory, `Audit entry ${rowMatch[1]} has no source category heading`);
      entries.push({
        id: rowMatch[1],
        title: rowMatch[2],
        purpose: rowMatch[3],
        classification: rowMatch[4],
        sourceCategory,
      });
    }
  }

  return entries;
}

test("all audited YAML files load with no missing or extra IDs", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  const auditIds = (await auditedEntries()).map((entry) => entry.id);
  const patternIds = patterns.map((pattern) => pattern.id);

  assert.equal(patterns.length, 92);
  assert.equal(new Set(patternIds).size, 92);
  assert.deepEqual([...patternIds].sort(), [...auditIds].sort());
});

test("all YAML catalog facts faithfully match the source audit", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  const auditEntries = await auditedEntries();

  assert.equal(auditEntries.length, 92);
  for (const entry of auditEntries) {
    const pattern = patternsById.get(entry.id);
    assert.ok(pattern, `Missing YAML for ${entry.id}`);
    assert.equal(pattern.id, entry.id, `${entry.id}: id`);
    assert.equal(pattern.title, entry.title, `${entry.id}: title`);
    assert.deepEqual(pattern.purpose, [entry.purpose], `${entry.id}: purpose`);
    assert.equal(pattern.category, sourceCategoryMapping[entry.sourceCategory], `${entry.id}: normalized category`);

    const observed = pattern.evidence.find((evidence) => evidence.type === "observed");
    assert.ok(observed, `${entry.id}: observed evidence`);
    assert.equal(observed.source?.category, entry.sourceCategory, `${entry.id}: source category`);
    assert.equal(observed.source?.classification, entry.classification, `${entry.id}: source classification`);
  }
});

test("converted YAML files conform to the conversion policy", async () => {
  const spikeIds = new Set(["VS-T11", "VS-I04", "VS-A03"]);
  const convertedPatterns = (await loadPatterns(patternsDirectory)).filter((pattern) => !spikeIds.has(pattern.id));
  const optionalFields = [
    "description",
    "visual",
    "audio",
    "timing",
    "implementation",
    "requirements",
    "failureModes",
    "relatedPatterns",
  ] as const;

  assert.equal(convertedPatterns.length, 89);
  for (const pattern of convertedPatterns) {
    assert.deepEqual(pattern.goodFor, [], `${pattern.id}: goodFor`);
    assert.deepEqual(pattern.avoidWhen, [], `${pattern.id}: avoidWhen`);
    assert.deepEqual(pattern.tags, [], `${pattern.id}: tags`);
    for (const field of optionalFields) {
      assert.equal(Object.hasOwn(pattern, field), false, `${pattern.id}: ${field} must be absent`);
    }

    assert.equal(pattern.evidence.some((evidence) => evidence.type === "inferred"), false, `${pattern.id}: inferred evidence`);
    assert.equal(pattern.evidence.length, 2, `${pattern.id}: evidence count`);

    const observed = pattern.evidence.filter((evidence) => evidence.type === "observed");
    const proposal = pattern.evidence.filter((evidence) => evidence.type === "proposal");
    assert.equal(observed.length, 1, `${pattern.id}: observed evidence count`);
    assert.equal(proposal.length, 1, `${pattern.id}: proposal evidence count`);
    assert.deepEqual(observed[0].scope, ["id", "title", "purpose"], `${pattern.id}: observed scope`);
    assert.deepEqual(proposal[0].scope, ["category"], `${pattern.id}: proposal scope`);
  }
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
