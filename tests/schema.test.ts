import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadPatternDocuments, loadPatterns } from "../src/load.js";
import { validatePattern, validatePatternDocuments } from "../src/validate.js";

const patternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));
const sourceAuditPath = new URL("../docs/source-audit.md", import.meta.url);
const originalSpikeIds = new Set(["VS-T11", "VS-I04", "VS-A03"]);
const p1SemanticEnrichmentIds = new Set([
  "VS-I02", "VS-L02", "VS-T13", "VS-S02",
  "VS-I03", "VS-G06", "VS-I13", "VS-C05",
]);
const p2ImplementationEnrichmentFields = {
  "VS-T02": ["visual", "timing", "implementation"],
  "VS-R01": ["visual", "timing", "implementation"],
  "VS-I02": ["visual", "implementation"],
  "VS-L02": ["visual", "implementation"],
  "VS-A01": ["audio", "timing", "implementation"],
  "VS-E09": ["timing", "implementation"],
  "VS-S01": ["visual", "implementation"],
} as const;
const p2ImplementationEnrichmentIds = new Set(Object.keys(p2ImplementationEnrichmentFields));
const h1ImplementationEnrichmentFields = {
  "VS-T01": ["visual", "timing", "implementation"],
  "VS-T03": ["visual", "timing", "implementation"],
  "VS-T04": ["visual", "timing", "implementation"],
  "VS-T05": ["visual", "timing", "implementation"],
  "VS-T06": ["visual", "timing", "implementation"],
  "VS-T07": ["visual", "timing", "implementation"],
  "VS-T08": ["visual", "timing", "implementation"],
  "VS-T10": ["visual", "implementation"],
  "VS-T12": ["visual", "implementation"],
  "VS-T13": ["visual", "timing", "implementation"],
  "VS-T14": ["visual", "timing", "implementation"],
} as const;
const h1ImplementationEnrichmentIds = new Set(Object.keys(h1ImplementationEnrichmentFields));
const h2ImplementationEnrichmentFields = {
  "VS-R02": ["visual", "timing", "implementation"],
  "VS-R03": ["visual", "timing", "implementation"],
  "VS-R04": ["visual", "timing", "implementation"],
  "VS-R05": ["timing", "implementation"],
  "VS-R06": ["visual", "implementation"],
  "VS-R07": ["timing", "implementation"],
  "VS-R08": ["visual", "timing", "implementation"],
  "VS-R11": ["timing", "implementation"],
  "VS-R12": ["visual", "implementation"],
  "VS-L01": ["visual", "implementation"],
  "VS-L03": ["visual", "implementation"],
  "VS-L04": ["visual", "implementation"],
  "VS-L05": ["visual", "timing", "implementation"],
  "VS-L06": ["visual", "implementation"],
  "VS-L07": ["visual", "implementation"],
  "VS-L08": ["visual", "implementation"],
  "VS-L09": ["visual", "implementation"],
  "VS-L10": ["visual", "implementation"],
} as const;
const h2ImplementationEnrichmentIds = new Set(Object.keys(h2ImplementationEnrichmentFields));
const h3ImplementationEnrichmentFields = {
  "VS-I01": ["visual", "timing", "implementation"],
  "VS-I03": ["visual", "implementation"],
  "VS-I05": ["visual", "timing", "implementation"],
  "VS-I06": ["visual", "implementation"],
  "VS-I07": ["visual", "implementation"],
  "VS-I08": ["visual", "implementation"],
  "VS-I09": ["visual", "timing", "implementation"],
  "VS-I10": ["visual", "implementation"],
  "VS-I11": ["visual", "implementation"],
  "VS-I12": ["visual", "implementation"],
  "VS-I13": ["visual", "implementation"],
  "VS-I14": ["visual", "implementation"],
} as const;
const h3ImplementationEnrichmentIds = new Set(Object.keys(h3ImplementationEnrichmentFields));
const optionalSemanticOrImplementationFields = [
  "description",
  "visual",
  "audio",
  "timing",
  "implementation",
  "requirements",
  "failureModes",
  "relatedPatterns",
] as const;

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

test("all Patterns satisfy the semantic enrichment contract", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  assert.equal(patterns.length, 92);

  for (const pattern of patterns) {
    assert.ok(pattern.tags.length > 0, `${pattern.id}: tags`);
    assert.ok(pattern.tags.length <= 3, `${pattern.id}: tag count`);
    assert.ok(pattern.tags.every((tag) => /^[a-z]+(?:-[a-z]+)*$/.test(tag)), `${pattern.id}: tag format`);
    assert.equal(new Set(pattern.tags).size, pattern.tags.length, `${pattern.id}: duplicate tag`);
    assert.ok(pattern.goodFor.length > 0, `${pattern.id}: goodFor`);
    assert.ok(pattern.goodFor.length <= 2, `${pattern.id}: goodFor count`);
    assert.equal(new Set(pattern.goodFor).size, pattern.goodFor.length, `${pattern.id}: duplicate goodFor`);
    assert.ok(pattern.avoidWhen.length > 0, `${pattern.id}: avoidWhen`);
    assert.ok(pattern.avoidWhen.length <= 2, `${pattern.id}: avoidWhen count`);
    assert.equal(new Set(pattern.avoidWhen).size, pattern.avoidWhen.length, `${pattern.id}: duplicate avoidWhen`);
    assert.ok(pattern.goodFor.every((entry) => !pattern.purpose.includes(entry)), `${pattern.id}: goodFor duplicates purpose`);
    assert.ok(pattern.avoidWhen.every((entry) => !pattern.purpose.includes(entry)), `${pattern.id}: avoidWhen duplicates purpose`);
    for (const field of optionalSemanticOrImplementationFields) {
      if (!originalSpikeIds.has(pattern.id) && !p2ImplementationEnrichmentIds.has(pattern.id) && !h1ImplementationEnrichmentIds.has(pattern.id) && !h2ImplementationEnrichmentIds.has(pattern.id) && !h3ImplementationEnrichmentIds.has(pattern.id)) {
        assert.equal(Object.hasOwn(pattern, field), false, `${pattern.id}: ${field} must be absent`);
      }
    }
  }
});

test("source-converted Patterns preserve semantic provenance separation", async () => {
  const sourceConvertedPatterns = (await loadPatterns(patternsDirectory)).filter((pattern) => (
    !originalSpikeIds.has(pattern.id) && !p2ImplementationEnrichmentIds.has(pattern.id)
    && !h1ImplementationEnrichmentIds.has(pattern.id) && !h2ImplementationEnrichmentIds.has(pattern.id)
    && !h3ImplementationEnrichmentIds.has(pattern.id)
  ));

  assert.equal(sourceConvertedPatterns.length, 41);
  for (const pattern of sourceConvertedPatterns) {
    for (const field of optionalSemanticOrImplementationFields) {
      assert.equal(Object.hasOwn(pattern, field), false, `${pattern.id}: ${field} must be absent`);
    }

    const observed = pattern.evidence.filter((evidence) => evidence.type === "observed");
    const categoryProposal = pattern.evidence.filter((evidence) => (
      evidence.type === "proposal" && JSON.stringify(evidence.scope) === JSON.stringify(["category"])
    ));
    const tagInference = pattern.evidence.filter((evidence) => (
      evidence.type === "inferred" && JSON.stringify(evidence.scope) === JSON.stringify(["tags"])
    ));
    const semanticProposal = pattern.evidence.filter((evidence) => (
      evidence.type === "proposal" && JSON.stringify(evidence.scope) === JSON.stringify(["goodFor", "avoidWhen"])
    ));

    assert.equal(pattern.evidence.length, 4, `${pattern.id}: evidence count`);
    assert.equal(observed.length, 1, `${pattern.id}: observed evidence count`);
    assert.deepEqual(observed[0].scope, ["id", "title", "purpose"], `${pattern.id}: observed scope`);
    assert.equal(categoryProposal.length, 1, `${pattern.id}: category proposal`);
    assert.equal(tagInference.length, 1, `${pattern.id}: tag inference`);
    assert.equal(tagInference[0].confidence, 0.8, `${pattern.id}: tag inference confidence`);
    assert.equal(tagInference[0].source, undefined, `${pattern.id}: tag inference source`);
    assert.equal(semanticProposal.length, 1, `${pattern.id}: semantic proposal`);
    assert.equal(semanticProposal[0].confidence, 0.5, `${pattern.id}: semantic proposal confidence`);
    assert.equal(semanticProposal[0].source, undefined, `${pattern.id}: semantic proposal source`);
  }
});

test("P2 implementation spike fields and proposal provenance are bounded to seven Patterns", async () => {
  const patternsById = new Map((await loadPatterns(patternsDirectory)).map((pattern) => [pattern.id, pattern]));

  for (const [id, fields] of Object.entries(p2ImplementationEnrichmentFields)) {
    const pattern = patternsById.get(id);
    assert.ok(pattern, `Missing ${id}`);
    const addedFields = ["visual", "audio", "timing", "implementation"].filter((field) => Object.hasOwn(pattern, field));
    assert.deepEqual(addedFields, fields, `${id}: implementation fields`);
    assert.equal(pattern.implementation?.deterministic, undefined, `${id}: deterministic must remain absent`);
    for (const field of ["description", "requirements", "failureModes", "relatedPatterns"]) {
      assert.equal(Object.hasOwn(pattern, field), false, `${id}: ${field} must remain absent`);
    }

    const proposals = pattern.evidence.filter((evidence) => (
      evidence.type === "proposal"
      && evidence.confidence === 0.5
      && evidence.source === undefined
      && JSON.stringify(evidence.scope) === JSON.stringify(fields)
    ));
    assert.equal(proposals.length, 1, `${id}: implementation proposal evidence`);
  }
});

test("H1 caption implementation fields and proposal provenance are bounded to eleven Patterns", async () => {
  const patternsById = new Map((await loadPatterns(patternsDirectory)).map((pattern) => [pattern.id, pattern]));

  for (const [id, fields] of Object.entries(h1ImplementationEnrichmentFields)) {
    const pattern = patternsById.get(id);
    assert.ok(pattern, `Missing ${id}`);
    const addedFields = ["visual", "audio", "timing", "implementation"].filter((field) => Object.hasOwn(pattern, field));
    assert.deepEqual(addedFields, fields, `${id}: implementation fields`);
    assert.ok((pattern.implementation?.recipe.length ?? 0) > 0, `${id}: implementation recipe`);
    assert.equal(pattern.implementation?.deterministic, undefined, `${id}: deterministic must remain absent`);
    assert.equal(pattern.implementation?.rendererCandidates, undefined, `${id}: renderer candidates must remain absent`);

    const proposals = pattern.evidence.filter((evidence) => (
      evidence.type === "proposal"
      && evidence.confidence === 0.5
      && evidence.source === undefined
      && JSON.stringify(evidence.scope) === JSON.stringify(fields)
    ));
    assert.equal(proposals.length, 1, `${id}: implementation proposal evidence`);
  }
});

test("H2 reaction and layout implementation fields and proposal provenance are bounded to eighteen Patterns", async () => {
  const patternsById = new Map((await loadPatterns(patternsDirectory)).map((pattern) => [pattern.id, pattern]));

  for (const [id, fields] of Object.entries(h2ImplementationEnrichmentFields)) {
    const pattern = patternsById.get(id);
    assert.ok(pattern, `Missing ${id}`);
    const addedFields = ["visual", "audio", "timing", "implementation"].filter((field) => Object.hasOwn(pattern, field));
    assert.deepEqual(addedFields, fields, `${id}: implementation fields`);
    assert.ok((pattern.implementation?.recipe.length ?? 0) > 0, `${id}: implementation recipe`);
    assert.equal(pattern.implementation?.deterministic, undefined, `${id}: deterministic must remain absent`);
    assert.equal(pattern.implementation?.rendererCandidates, undefined, `${id}: renderer candidates must remain absent`);

    const proposals = pattern.evidence.filter((evidence) => (
      evidence.type === "proposal"
      && evidence.confidence === 0.5
      && evidence.source === undefined
      && JSON.stringify(evidence.scope) === JSON.stringify(fields)
    ));
    assert.equal(proposals.length, 1, `${id}: implementation proposal evidence`);
  }
});

test("H3 information implementation fields and proposal provenance are bounded to twelve Patterns", async () => {
  const patternsById = new Map((await loadPatterns(patternsDirectory)).map((pattern) => [pattern.id, pattern]));

  for (const [id, fields] of Object.entries(h3ImplementationEnrichmentFields)) {
    const pattern = patternsById.get(id);
    assert.ok(pattern, `Missing ${id}`);
    const addedFields = ["visual", "audio", "timing", "implementation"].filter((field) => Object.hasOwn(pattern, field));
    assert.deepEqual(addedFields, fields, `${id}: implementation fields`);
    assert.ok((pattern.implementation?.recipe.length ?? 0) > 0, `${id}: implementation recipe`);
    assert.equal(pattern.implementation?.deterministic, undefined, `${id}: deterministic must remain absent`);
    assert.equal(pattern.implementation?.rendererCandidates, undefined, `${id}: renderer candidates must remain absent`);

    const proposals = pattern.evidence.filter((evidence) => (
      evidence.type === "proposal"
      && evidence.confidence === 0.5
      && evidence.source === undefined
      && JSON.stringify(evidence.scope) === JSON.stringify(fields)
    ));
    assert.equal(proposals.length, 1, `${id}: implementation proposal evidence`);
  }
});

test("P1 semantic pairs retain distinct decision boundaries", async () => {
  const patternsById = new Map((await loadPatterns(patternsDirectory)).map((pattern) => [pattern.id, pattern]));
  const pairs = [
    ["VS-I02", "VS-L02"],
    ["VS-T13", "VS-S02"],
    ["VS-I03", "VS-G06"],
    ["VS-I13", "VS-C05"],
  ] as const;

  for (const [leftId, rightId] of pairs) {
    const left = patternsById.get(leftId);
    const right = patternsById.get(rightId);
    assert.ok(left, `Missing ${leftId}`);
    assert.ok(right, `Missing ${rightId}`);
    assert.notDeepEqual(left.tags, right.tags, `${leftId}/${rightId}: tags`);
    assert.notDeepEqual(left.goodFor, right.goodFor, `${leftId}/${rightId}: goodFor`);
    assert.notDeepEqual(left.avoidWhen, right.avoidWhen, `${leftId}/${rightId}: avoidWhen`);
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
