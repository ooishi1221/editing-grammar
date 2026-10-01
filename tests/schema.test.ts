import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { EditingPattern, ImplementationParameterDeclaration } from "../schema/pattern.js";
import { currentContractIds, historicalExceptionIds, semanticOnlyIds } from "../src/handoff.js";
import { loadPatternDocuments, loadPatterns } from "../src/load.js";
import { validatePattern, validatePatternDocuments } from "../src/validate.js";

const patternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));
const sourceAuditPath = new URL("../docs/source-audit.md", import.meta.url);
const v02ResearchDerivedPatternIds = new Set(["VS-I15"]);
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
const h4ImplementationEnrichmentFields = {
  "VS-E01": ["timing", "implementation"],
  "VS-E02": ["audio", "timing", "implementation"],
  "VS-E03": ["visual", "timing", "implementation"],
  "VS-E04": ["visual", "timing", "implementation"],
  "VS-E05": ["visual", "timing", "implementation"],
  "VS-E06": ["visual", "timing", "implementation"],
  "VS-E07": ["visual", "timing", "implementation"],
  "VS-E08": ["visual", "timing", "implementation"],
  "VS-E10": ["timing", "implementation"],
  "VS-A02": ["audio", "timing", "implementation"],
  "VS-A04": ["audio", "timing", "implementation"],
  "VS-A05": ["audio", "timing", "implementation"],
  "VS-A06": ["audio", "timing", "implementation"],
  "VS-A08": ["audio", "timing", "implementation"],
} as const;
const h4ImplementationEnrichmentIds = new Set(Object.keys(h4ImplementationEnrichmentFields));
const h5ImplementationEnrichmentFields = {
  "VS-G01": ["visual", "timing", "implementation"],
  "VS-G02": ["visual", "implementation"],
  "VS-G03": ["visual", "timing", "implementation"],
  "VS-G04": ["visual", "implementation"],
  "VS-G05": ["visual", "timing", "implementation"],
  "VS-G06": ["visual", "implementation"],
  "VS-G07": ["visual", "implementation"],
  "VS-G08": ["visual", "implementation"],
  "VS-C01": ["visual", "timing", "implementation"],
  "VS-C02": ["visual", "timing", "implementation"],
  "VS-C03": ["visual", "timing", "implementation"],
  "VS-C04": ["visual", "timing", "implementation"],
  "VS-C05": ["visual", "implementation"],
  "VS-C06": ["visual", "timing", "implementation"],
} as const;
const h5ImplementationEnrichmentIds = new Set(Object.keys(h5ImplementationEnrichmentFields));
const h6ImplementationEnrichmentFields = {
  "VS-S02": ["visual", "timing", "implementation"],
  "VS-S03": ["visual", "implementation"],
  "VS-S04": ["visual", "timing", "implementation"],
  "VS-B02": ["visual", "timing", "implementation"],
  "VS-B03": ["visual", "timing", "implementation"],
} as const;
const h6ImplementationEnrichmentIds = new Set(Object.keys(h6ImplementationEnrichmentFields));
const parameterContractSpikeIds = new Set(["VS-T02", "VS-I02", "VS-A01", "VS-E02", "VS-G02", "VS-S01", "VS-S03", "VS-L05"]);
const m1MigratedCaptionIds = new Set(["VS-T01", "VS-T03", "VS-T04", "VS-T05", "VS-T06", "VS-T07", "VS-T08", "VS-T10", "VS-T12", "VS-T13", "VS-T14"]);
const m2MigratedReactionLayoutIds = new Set([
  "VS-R01", "VS-R02", "VS-R03", "VS-R04", "VS-R05", "VS-R06", "VS-R07", "VS-R08", "VS-R11", "VS-R12",
  "VS-L01", "VS-L02", "VS-L03", "VS-L04", "VS-L06", "VS-L07", "VS-L08", "VS-L09", "VS-L10",
]);
const m3MigratedInformationIds = new Set([
  "VS-I01", "VS-I03", "VS-I05", "VS-I06", "VS-I07", "VS-I08",
  "VS-I09", "VS-I10", "VS-I11", "VS-I12", "VS-I13", "VS-I14",
]);
const m4MigratedTransitionAudioIds = new Set([
  "VS-E01", "VS-E03", "VS-E04", "VS-E05", "VS-E06", "VS-E07", "VS-E08", "VS-E10",
  "VS-A02", "VS-A04", "VS-A05", "VS-A06", "VS-A08",
]);
const m5MigratedStateRetentionShortsBrandingIds = new Set([
  "VS-G01", "VS-G03", "VS-G04", "VS-G05", "VS-G06", "VS-G07", "VS-G08",
  "VS-C01", "VS-C02", "VS-C03", "VS-C04", "VS-C05", "VS-C06",
  "VS-S02", "VS-S04", "VS-B02", "VS-B03",
]);
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

function parameterizedPattern(parameters: unknown): Record<string, unknown> {
  return {
    id: "VS-P01",
    title: "Parameter contract",
    category: "captions",
    purpose: ["test"],
    goodFor: [],
    avoidWhen: [],
    tags: [],
    implementation: { parameters },
    evidence: [{ type: "proposal", confidence: 0.5, scope: ["implementation"] }],
  };
}

function declaredParameter(pattern: EditingPattern, key: string): ImplementationParameterDeclaration {
  const parameter = pattern.implementation?.parameters?.[key];
  assert.ok(typeof parameter === "object" && parameter !== null && "kind" in parameter, `${pattern.id}.${key}: declaration`);
  return parameter as ImplementationParameterDeclaration;
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

test("the frozen v0.1 source-audited catalog remains exact while current main adds VS-I15", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  const auditIds = (await auditedEntries()).map((entry) => entry.id);
  const patternIds = patterns.map((pattern) => pattern.id);

  assert.equal(auditIds.length, 92);
  assert.equal(patterns.length, 93);
  assert.equal(new Set(patternIds).size, 93);
  assert.deepEqual(
    [...patternIds].sort(),
    [...new Set([...auditIds, ...v02ResearchDerivedPatternIds])].sort(),
  );
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
  assert.equal(patterns.length, 93);

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
      if (!originalSpikeIds.has(pattern.id) && !p2ImplementationEnrichmentIds.has(pattern.id) && !h1ImplementationEnrichmentIds.has(pattern.id) && !h2ImplementationEnrichmentIds.has(pattern.id) && !h3ImplementationEnrichmentIds.has(pattern.id) && !h4ImplementationEnrichmentIds.has(pattern.id) && !h5ImplementationEnrichmentIds.has(pattern.id) && !h6ImplementationEnrichmentIds.has(pattern.id) && !v02ResearchDerivedPatternIds.has(pattern.id)) {
        assert.equal(Object.hasOwn(pattern, field), false, `${pattern.id}: ${field} must be absent`);
      }
    }
  }
});

test("source-converted Patterns preserve semantic provenance separation", async () => {
  const sourceConvertedPatterns = (await loadPatterns(patternsDirectory)).filter((pattern) => (
    !originalSpikeIds.has(pattern.id) && !p2ImplementationEnrichmentIds.has(pattern.id)
    && !h1ImplementationEnrichmentIds.has(pattern.id) && !h2ImplementationEnrichmentIds.has(pattern.id)
    && !h3ImplementationEnrichmentIds.has(pattern.id) && !h4ImplementationEnrichmentIds.has(pattern.id)
    && !h5ImplementationEnrichmentIds.has(pattern.id) && !h6ImplementationEnrichmentIds.has(pattern.id)
    && !v02ResearchDerivedPatternIds.has(pattern.id)
  ));

  assert.equal(sourceConvertedPatterns.length, 8);
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

test("VS-I15 is a post-v0.1 research-derived Pattern with explicit provenance", async () => {
  const pattern = (await loadPatterns(patternsDirectory)).find((candidate) => candidate.id === "VS-I15");
  assert.ok(pattern);
  assert.equal(pattern.title, "商品同定・パックショット");
  assert.equal(pattern.category, "information");
  assert.deepEqual(pattern.tags, ["product", "package", "pack-shot"]);
  assert.equal(pattern.visual, undefined);
  assert.equal(pattern.audio, undefined);
  assert.equal(pattern.timing, undefined);
  assert.deepEqual(pattern.implementation?.recipe, [
    "receive the exact supplied product identity and product asset",
    "expose the supplied product or package as the item that must remain identifiable",
    "preserve exact product/package identity rather than substituting a generic category visual",
  ]);
  assert.equal(declaredParameter(pattern, "productIdentity").valueType, "string");
  assert.equal(declaredParameter(pattern, "productAsset").valueType, "string");

  const purposeEvidence = pattern.evidence.filter((entry) => entry.type === "inferred" && JSON.stringify(entry.scope) === JSON.stringify(["purpose"]));
  assert.equal(purposeEvidence.length, 3);
  assert.deepEqual(purposeEvidence.map((entry) => entry.source?.location), [
    "research/composition/observations.yaml / O-C01-028 / 00:28",
    "research/composition/observations.yaml / O-C03-028 / 00:28",
    "research/composition/observations.yaml / O-C04-028 / 00:28",
  ]);
  assert.ok(pattern.evidence.some((entry) => entry.type === "proposal" && JSON.stringify(entry.scope) === JSON.stringify(["id", "title", "category"])));
  assert.ok(pattern.evidence.some((entry) => entry.type === "proposal" && JSON.stringify(entry.scope) === JSON.stringify(["goodFor", "avoidWhen"])));
  assert.ok(pattern.evidence.some((entry) => entry.type === "proposal" && JSON.stringify(entry.scope) === JSON.stringify(["implementation"])));
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

test("H4 transition and audio implementation fields and proposal provenance are bounded to fourteen Patterns", async () => {
  const patternsById = new Map((await loadPatterns(patternsDirectory)).map((pattern) => [pattern.id, pattern]));

  for (const [id, fields] of Object.entries(h4ImplementationEnrichmentFields)) {
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

test("H5 game UI and retention implementation fields and proposal provenance are bounded to fourteen Patterns", async () => {
  const patternsById = new Map((await loadPatterns(patternsDirectory)).map((pattern) => [pattern.id, pattern]));

  for (const [id, fields] of Object.entries(h5ImplementationEnrichmentFields)) {
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

test("H6 Shorts and functional branding implementation fields and proposal provenance are bounded to five Patterns", async () => {
  const patternsById = new Map((await loadPatterns(patternsDirectory)).map((pattern) => [pattern.id, pattern]));

  for (const [id, fields] of Object.entries(h6ImplementationEnrichmentFields)) {
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

test("implementation parameter declarations validate", () => {
  const validDeclarations = [
    { kind: "runtime-input", description: "Required runtime input.", required: true, valueType: "string" },
    { kind: "context", description: "Required execution context.", required: true, valueType: "object" },
    { kind: "context", description: "Optional execution context.", required: false, valueType: "object" },
    { kind: "constant", description: "String grammar constant.", required: false, valueType: "string", value: "impact-accent" },
    { kind: "constant", description: "Number grammar constant.", required: false, valueType: "number", value: 2 },
  ];

  for (const declaration of validDeclarations) {
    assert.equal(validatePattern(parameterizedPattern({ parameter: declaration })).valid, true, `valid declaration: ${declaration.kind}`);
  }
});

test("implementation parameter declarations reject invalid contracts", () => {
  const invalidDeclarations = [
    { label: "runtime input with value", declaration: { kind: "runtime-input", description: "Runtime input.", required: true, valueType: "string", value: "forbidden" } },
    { label: "context with value", declaration: { kind: "context", description: "Context.", required: true, valueType: "object", value: {} } },
    { label: "constant without value", declaration: { kind: "constant", description: "Constant.", required: false, valueType: "string" } },
    { label: "constant required true", declaration: { kind: "constant", description: "Constant.", required: true, valueType: "string", value: "fixed" } },
    { label: "constant value type mismatch", declaration: { kind: "constant", description: "Constant.", required: false, valueType: "number", value: "two" } },
    { label: "invalid kind", declaration: { kind: "unsupported", description: "Invalid kind.", required: true, valueType: "string" } },
    { label: "invalid value type", declaration: { kind: "runtime-input", description: "Invalid type.", required: true, valueType: "date" } },
    { label: "missing description", declaration: { kind: "runtime-input", required: true, valueType: "string" } },
    { label: "runtime input missing required", declaration: { kind: "runtime-input", description: "Missing required.", valueType: "string" } },
    { label: "context missing required", declaration: { kind: "context", description: "Missing required.", valueType: "object" } },
    { label: "undeclared object", declaration: { arbitrary: "object parameter" } },
    { label: "legacy string scalar", declaration: "legacy scalar" },
    { label: "legacy number scalar", declaration: 2 },
    { label: "legacy boolean scalar", declaration: true },
  ];

  for (const { label, declaration } of invalidDeclarations) {
    assert.equal(validatePattern(parameterizedPattern({ parameter: declaration })).valid, false, label);
  }
});

test("all implementation parameters use declarations after the P3 cutover", async () => {
  const allowedKinds = new Set(["runtime-input", "context", "constant"]);
  const allowedValueTypes = new Set(["string", "number", "boolean", "object", "array"]);
  const currentContractIds = new Set([
    ...p2ImplementationEnrichmentIds,
    ...h1ImplementationEnrichmentIds,
    ...h2ImplementationEnrichmentIds,
    ...h3ImplementationEnrichmentIds,
    ...h4ImplementationEnrichmentIds,
    ...h5ImplementationEnrichmentIds,
    ...h6ImplementationEnrichmentIds,
    ...v02ResearchDerivedPatternIds,
  ]);
  const patterns = await loadPatterns(patternsDirectory);
  const parameterizedPatterns = patterns.filter((pattern) => Object.keys(pattern.implementation?.parameters ?? {}).length > 0);

  assert.equal(currentContractIds.size, 82);
  assert.equal(parameterizedPatterns.filter((pattern) => currentContractIds.has(pattern.id)).length, 81);
  assert.deepEqual(
    patterns.filter((pattern) => currentContractIds.has(pattern.id) && Object.keys(pattern.implementation?.parameters ?? {}).length === 0).map((pattern) => pattern.id),
    ["VS-E09"],
  );

  for (const pattern of parameterizedPatterns) {
    for (const [key, parameter] of Object.entries(pattern.implementation?.parameters ?? {})) {
      assert.ok(typeof parameter === "object" && parameter !== null, `${pattern.id}.${key}: declaration object`);
      const declaration = parameter as ImplementationParameterDeclaration;
      assert.ok(allowedKinds.has(declaration.kind), `${pattern.id}.${key}: kind`);
      assert.ok(declaration.description.length > 0, `${pattern.id}.${key}: description`);
      assert.equal(typeof declaration.required, "boolean", `${pattern.id}.${key}: required`);
      assert.ok(allowedValueTypes.has(declaration.valueType), `${pattern.id}.${key}: value type`);
      assert.equal(declaration.kind === "constant", Object.hasOwn(declaration, "value"), `${pattern.id}.${key}: constant value`);
    }
  }
});

test("visual motion scalar parameters remain valid outside the implementation contract", async () => {
  const result = validatePattern({
    id: "VS-X08",
    title: "Motion scalar parameters",
    category: "captions",
    purpose: ["test"],
    goodFor: [],
    avoidWhen: [],
    tags: [],
    visual: { motion: { type: "scale", parameters: { fromScale: 1.0, peakScale: 1.12, enabled: true } } },
    evidence: [{ type: "proposal", confidence: 0.5, scope: ["visual.motion"] }],
  });
  assert.equal(result.valid, true);

  const patternsById = new Map((await loadPatterns(patternsDirectory)).map((pattern) => [pattern.id, pattern]));
  assert.deepEqual(patternsById.get("VS-T11")?.visual?.motion?.parameters, { fromScale: 1.0, peakScale: 1.12 });
});

test("representative P3 parameter migrations use complete declarations", async () => {
  const allowedKinds = new Set(["runtime-input", "context", "constant"]);
  const allowedValueTypes = new Set(["string", "number", "boolean", "object", "array"]);
  const patterns = (await loadPatterns(patternsDirectory)).filter((pattern) => parameterContractSpikeIds.has(pattern.id));

  assert.equal(patterns.length, parameterContractSpikeIds.size);
  for (const pattern of patterns) {
    const parameters = pattern.implementation?.parameters;
    assert.ok(parameters, `${pattern.id}: parameters`);
    for (const parameter of Object.values(parameters)) {
      assert.equal(typeof parameter, "object", `${pattern.id}: no legacy scalar parameter`);
      const declaration = parameter as ImplementationParameterDeclaration;
      assert.ok(allowedKinds.has(declaration.kind), `${pattern.id}: parameter kind`);
      assert.ok(declaration.description.length > 0, `${pattern.id}: parameter description`);
      assert.equal(typeof declaration.required, "boolean", `${pattern.id}: parameter required`);
      assert.ok(allowedValueTypes.has(declaration.valueType), `${pattern.id}: parameter value type`);
      assert.equal(declaration.kind === "constant", Object.hasOwn(declaration, "value"), `${pattern.id}: constant value`);
    }
  }

  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  const subjectCount = declaredParameter(patternsById.get("VS-I02")!, "subjectCount");
  assert.deepEqual(subjectCount, { kind: "constant", description: "Number of subjects in the two-item comparison grammar.", required: false, valueType: "number", value: 2 });

  const speakerKey = declaredParameter(patternsById.get("VS-T02")!, "speakerKey");
  assert.equal(speakerKey.kind, "runtime-input");
  assert.equal(speakerKey.valueType, "string");
  assert.equal(speakerKey.required, true);

  const requiredSafeArea = declaredParameter(patternsById.get("VS-S01")!, "safeAreaProfile");
  assert.equal(requiredSafeArea.kind, "context");
  assert.equal(requiredSafeArea.valueType, "object");
  assert.equal(requiredSafeArea.required, true);

  const optionalSafeArea = declaredParameter(patternsById.get("VS-S03")!, "safeAreaProfile");
  assert.equal(optionalSafeArea.kind, "context");
  assert.equal(optionalSafeArea.required, false);

  const scoreState = declaredParameter(patternsById.get("VS-G02")!, "scoreState");
  assert.equal(scoreState.kind, "runtime-input");
  assert.equal(scoreState.valueType, "object");
  assert.equal(scoreState.required, true);
});

test("M1 caption parameter migrations use complete declarations", async () => {
  const allowedKinds = new Set(["runtime-input", "context", "constant"]);
  const allowedValueTypes = new Set(["string", "number", "boolean", "object", "array"]);
  const currentContractIds = new Set([
    ...p2ImplementationEnrichmentIds,
    ...h1ImplementationEnrichmentIds,
    ...h2ImplementationEnrichmentIds,
    ...h3ImplementationEnrichmentIds,
    ...h4ImplementationEnrichmentIds,
    ...h5ImplementationEnrichmentIds,
    ...h6ImplementationEnrichmentIds,
  ]);
  const fullyDeclaredIds = new Set([...parameterContractSpikeIds, ...m1MigratedCaptionIds]);
  const patterns = (await loadPatterns(patternsDirectory)).filter((pattern) => currentContractIds.has(pattern.id));
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  assert.equal(fullyDeclaredIds.size, 19);
  assert.deepEqual([...m1MigratedCaptionIds].filter((id) => originalSpikeIds.has(id)), []);
  for (const id of fullyDeclaredIds) {
    const parameters = patternsById.get(id)?.implementation?.parameters;
    assert.ok(parameters, `${id}: parameters`);
    for (const parameter of Object.values(parameters)) {
      assert.equal(typeof parameter, "object", `${id}: no legacy scalar parameter`);
      const declaration = parameter as ImplementationParameterDeclaration;
      assert.ok(allowedKinds.has(declaration.kind), `${id}: parameter kind`);
      assert.ok(declaration.description.length > 0, `${id}: parameter description`);
      assert.equal(typeof declaration.required, "boolean", `${id}: parameter required`);
      assert.ok(allowedValueTypes.has(declaration.valueType), `${id}: parameter value type`);
      assert.equal(declaration.kind === "constant", Object.hasOwn(declaration, "value"), `${id}: constant value`);
    }
  }

  const patternsForRepresentativeAssertions = new Map([...patternsById]);
  const emotionState = declaredParameter(patternsForRepresentativeAssertions.get("VS-T03")!, "emotionState");
  assert.equal(emotionState.kind, "runtime-input");
  assert.equal(emotionState.valueType, "string");
  assert.equal(emotionState.required, true);

  const languagePair = declaredParameter(patternsForRepresentativeAssertions.get("VS-T12")!, "languagePair");
  assert.equal(languagePair.kind, "runtime-input");
  assert.equal(languagePair.valueType, "array");
  assert.equal(languagePair.required, true);

  const readingPosition = declaredParameter(patternsForRepresentativeAssertions.get("VS-T13")!, "readingPosition");
  assert.equal(readingPosition.kind, "runtime-input");
  assert.equal(readingPosition.valueType, "object");
  assert.equal(readingPosition.required, true);

  const editorialLayer = declaredParameter(patternsForRepresentativeAssertions.get("VS-T14")!, "editorialLayer");
  assert.deepEqual(editorialLayer, { kind: "constant", description: "Structural layer identity separating editorial comments from speaker dialogue.", required: false, valueType: "string", value: "editorial-comment" });
});

test("M2 reaction and layout parameter migrations use complete declarations and preserve visual motion parameters", async () => {
  const allowedKinds = new Set(["runtime-input", "context", "constant"]);
  const allowedValueTypes = new Set(["string", "number", "boolean", "object", "array"]);
  const currentContractIds = new Set([
    ...p2ImplementationEnrichmentIds,
    ...h1ImplementationEnrichmentIds,
    ...h2ImplementationEnrichmentIds,
    ...h3ImplementationEnrichmentIds,
    ...h4ImplementationEnrichmentIds,
    ...h5ImplementationEnrichmentIds,
    ...h6ImplementationEnrichmentIds,
  ]);
  const fullyDeclaredIds = new Set([
    ...parameterContractSpikeIds,
    ...m1MigratedCaptionIds,
    ...m2MigratedReactionLayoutIds,
  ]);
  const patterns = (await loadPatterns(patternsDirectory)).filter((pattern) => currentContractIds.has(pattern.id));
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  assert.equal(m2MigratedReactionLayoutIds.size, 19);
  assert.equal(fullyDeclaredIds.size, 38);
  for (const id of fullyDeclaredIds) {
    const parameters = patternsById.get(id)?.implementation?.parameters;
    assert.ok(parameters, `${id}: parameters`);
    for (const parameter of Object.values(parameters)) {
      assert.equal(typeof parameter, "object", `${id}: no legacy scalar parameter`);
      const declaration = parameter as ImplementationParameterDeclaration;
      assert.ok(allowedKinds.has(declaration.kind), `${id}: parameter kind`);
      assert.ok(declaration.description.length > 0, `${id}: parameter description`);
      assert.equal(typeof declaration.required, "boolean", `${id}: parameter required`);
      assert.ok(allowedValueTypes.has(declaration.valueType), `${id}: parameter value type`);
      assert.equal(declaration.kind === "constant", Object.hasOwn(declaration, "value"), `${id}: constant value`);
    }
  }

  const expectedMotionParameters = new Map([
    ["VS-R01", { emphasisTarget: "subject or keyword" }],
    ["VS-R02", { targetId: "selected face or subject identity" }],
    ["VS-R03", { targetId: "selected emphasis target identity" }],
    ["VS-R04", { frameTarget: "selected frame or beat identity" }],
    ["VS-R08", { impactEvent: "supplied impact event" }],
  ]);
  for (const [id, expected] of expectedMotionParameters) {
    assert.deepEqual(patternsById.get(id)?.visual?.motion?.parameters, expected, `${id}: visual.motion.parameters`);
  }

  const reactionSequence = declaredParameter(patternsById.get("VS-R11")!, "reactionSequence");
  assert.equal(reactionSequence.kind, "runtime-input");
  assert.equal(reactionSequence.valueType, "array");
  assert.equal(reactionSequence.required, true);

  const subjectCount = declaredParameter(patternsById.get("VS-L02")!, "subjectCount");
  assert.deepEqual(subjectCount, { kind: "constant", description: "Number of subjects in the simultaneous two-source layout grammar.", required: false, valueType: "number", value: 2 });

  const targetFrame = declaredParameter(patternsById.get("VS-L09")!, "targetFrame");
  assert.equal(targetFrame.kind, "context");
  assert.equal(targetFrame.valueType, "string");
  assert.equal(targetFrame.required, true);

  const sourceRegion = declaredParameter(patternsById.get("VS-L10")!, "sourceRegion");
  assert.equal(sourceRegion.kind, "runtime-input");
  assert.equal(sourceRegion.valueType, "object");
  assert.equal(sourceRegion.required, true);
});

test("M3 information parameter migrations use complete runtime-input declarations", async () => {
  const currentContractIds = new Set([
    ...p2ImplementationEnrichmentIds,
    ...h1ImplementationEnrichmentIds,
    ...h2ImplementationEnrichmentIds,
    ...h3ImplementationEnrichmentIds,
    ...h4ImplementationEnrichmentIds,
    ...h5ImplementationEnrichmentIds,
    ...h6ImplementationEnrichmentIds,
  ]);
  const fullyDeclaredIds = new Set([
    ...parameterContractSpikeIds,
    ...m1MigratedCaptionIds,
    ...m2MigratedReactionLayoutIds,
    ...m3MigratedInformationIds,
  ]);
  const patterns = (await loadPatterns(patternsDirectory)).filter((pattern) => currentContractIds.has(pattern.id));
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  assert.equal(m3MigratedInformationIds.size, 12);
  assert.equal(fullyDeclaredIds.size, 50);
  for (const id of m3MigratedInformationIds) {
    const parameters = patternsById.get(id)?.implementation?.parameters;
    assert.ok(parameters, `${id}: parameters`);
    for (const parameter of Object.values(parameters)) {
      assert.equal(typeof parameter, "object", `${id}: no legacy scalar parameter`);
      const declaration = parameter as ImplementationParameterDeclaration;
      assert.equal(declaration.kind, "runtime-input", `${id}: runtime-input kind`);
      assert.ok(declaration.description.length > 0, `${id}: parameter description`);
      assert.equal(declaration.required, true, `${id}: required`);
      assert.ok(["string", "number", "boolean", "object", "array"].includes(declaration.valueType), `${id}: parameter value type`);
      assert.equal(Object.hasOwn(declaration, "value"), false, `${id}: runtime input must not contain value`);
    }
  }

  const definitionText = declaredParameter(patternsById.get("VS-I01")!, "definitionText");
  assert.equal(definitionText.kind, "runtime-input");
  assert.equal(definitionText.valueType, "string");
  assert.equal(definitionText.required, true);

  const stepSequence = declaredParameter(patternsById.get("VS-I03")!, "stepSequence");
  assert.equal(stepSequence.kind, "runtime-input");
  assert.equal(stepSequence.valueType, "array");
  assert.equal(stepSequence.required, true);

  const tableData = declaredParameter(patternsById.get("VS-I07")!, "tableData");
  assert.equal(tableData.kind, "runtime-input");
  assert.equal(tableData.valueType, "object");
  assert.equal(tableData.required, true);

  const eventSequence = declaredParameter(patternsById.get("VS-I08")!, "eventSequence");
  assert.equal(eventSequence.kind, "runtime-input");
  assert.equal(eventSequence.valueType, "array");
  assert.equal(eventSequence.required, true);

  const rankingData = declaredParameter(patternsById.get("VS-I11")!, "rankingData");
  assert.equal(rankingData.kind, "runtime-input");
  assert.equal(rankingData.valueType, "array");
  assert.equal(rankingData.required, true);

  const conditionSet = declaredParameter(patternsById.get("VS-I14")!, "conditionSet");
  assert.equal(conditionSet.kind, "runtime-input");
  assert.equal(conditionSet.valueType, "array");
  assert.equal(conditionSet.required, true);
});

test("M4 transition and audio parameter migrations use complete runtime-input declarations", async () => {
  const currentContractIds = new Set([
    ...p2ImplementationEnrichmentIds,
    ...h1ImplementationEnrichmentIds,
    ...h2ImplementationEnrichmentIds,
    ...h3ImplementationEnrichmentIds,
    ...h4ImplementationEnrichmentIds,
    ...h5ImplementationEnrichmentIds,
    ...h6ImplementationEnrichmentIds,
  ]);
  const fullyDeclaredIds = new Set([
    ...parameterContractSpikeIds,
    ...m1MigratedCaptionIds,
    ...m2MigratedReactionLayoutIds,
    ...m3MigratedInformationIds,
    ...m4MigratedTransitionAudioIds,
  ]);
  const patterns = (await loadPatterns(patternsDirectory)).filter((pattern) => currentContractIds.has(pattern.id));
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  assert.equal(m4MigratedTransitionAudioIds.size, 13);
  assert.equal(fullyDeclaredIds.size, 63);
  for (const id of m4MigratedTransitionAudioIds) {
    const parameters = patternsById.get(id)?.implementation?.parameters;
    assert.ok(parameters, `${id}: parameters`);
    for (const parameter of Object.values(parameters)) {
      assert.equal(typeof parameter, "object", `${id}: no legacy scalar parameter`);
      const declaration = parameter as ImplementationParameterDeclaration;
      assert.equal(declaration.kind, "runtime-input", `${id}: runtime-input kind`);
      assert.ok(declaration.description.length > 0, `${id}: parameter description`);
      assert.equal(declaration.required, true, `${id}: required`);
      assert.ok(["string", "number", "boolean", "object", "array"].includes(declaration.valueType), `${id}: parameter value type`);
      assert.equal(Object.hasOwn(declaration, "value"), false, `${id}: runtime input must not contain value`);
    }
  }

  const momentSequence = declaredParameter(patternsById.get("VS-E03")!, "momentSequence");
  assert.equal(momentSequence.kind, "runtime-input");
  assert.equal(momentSequence.valueType, "array");
  assert.equal(momentSequence.required, true);

  const visualMatch = declaredParameter(patternsById.get("VS-E07")!, "visualMatch");
  assert.equal(visualMatch.kind, "runtime-input");
  assert.equal(visualMatch.valueType, "object");
  assert.equal(visualMatch.required, true);

  const elapsedInterval = declaredParameter(patternsById.get("VS-E08")!, "elapsedInterval");
  assert.equal(elapsedInterval.kind, "runtime-input");
  assert.equal(elapsedInterval.valueType, "object");
  assert.equal(elapsedInterval.required, true);

  const beatGrid = declaredParameter(patternsById.get("VS-A04")!, "beatGrid");
  assert.equal(beatGrid.kind, "runtime-input");
  assert.equal(beatGrid.valueType, "array");
  assert.equal(beatGrid.required, true);

  const resultState = declaredParameter(patternsById.get("VS-A06")!, "resultState");
  assert.equal(resultState.kind, "runtime-input");
  assert.equal(resultState.valueType, "string");
  assert.equal(resultState.required, true);

  const ambientSource = declaredParameter(patternsById.get("VS-A08")!, "ambientSource");
  assert.equal(ambientSource.kind, "runtime-input");
  assert.equal(ambientSource.valueType, "string");
  assert.equal(ambientSource.required, true);
});

test("M5 completes current-contract implementation parameter declarations", async () => {
  const currentContractIds = new Set([
    ...p2ImplementationEnrichmentIds,
    ...h1ImplementationEnrichmentIds,
    ...h2ImplementationEnrichmentIds,
    ...h3ImplementationEnrichmentIds,
    ...h4ImplementationEnrichmentIds,
    ...h5ImplementationEnrichmentIds,
    ...h6ImplementationEnrichmentIds,
  ]);
  const fullyDeclaredIds = new Set([
    ...parameterContractSpikeIds,
    ...m1MigratedCaptionIds,
    ...m2MigratedReactionLayoutIds,
    ...m3MigratedInformationIds,
    ...m4MigratedTransitionAudioIds,
    ...m5MigratedStateRetentionShortsBrandingIds,
  ]);
  const patterns = (await loadPatterns(patternsDirectory)).filter((pattern) => currentContractIds.has(pattern.id));
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  assert.equal(currentContractIds.size, 81);
  assert.equal(m5MigratedStateRetentionShortsBrandingIds.size, 17);
  assert.equal(fullyDeclaredIds.size, 80);
  for (const id of m5MigratedStateRetentionShortsBrandingIds) {
    const parameters = patternsById.get(id)?.implementation?.parameters;
    assert.ok(parameters, `${id}: parameters`);
    for (const parameter of Object.values(parameters)) {
      assert.equal(typeof parameter, "object", `${id}: no legacy scalar parameter`);
      const declaration = parameter as ImplementationParameterDeclaration;
      assert.equal(declaration.kind, "runtime-input", `${id}: runtime-input kind`);
      assert.ok(declaration.description.length > 0, `${id}: parameter description`);
      assert.equal(declaration.required, true, `${id}: required`);
      assert.ok(["string", "number", "boolean", "object", "array"].includes(declaration.valueType), `${id}: parameter value type`);
      assert.equal(Object.hasOwn(declaration, "value"), false, `${id}: runtime input must not contain value`);
    }
  }

  const parameterizedPatterns = patterns.filter((pattern) => Object.keys(pattern.implementation?.parameters ?? {}).length > 0);
  const noParameterPatterns = patterns.filter((pattern) => Object.keys(pattern.implementation?.parameters ?? {}).length === 0);
  assert.equal(parameterizedPatterns.length, 80);
  assert.deepEqual(noParameterPatterns.map((pattern) => pattern.id), ["VS-E09"]);
  assert.deepEqual([...fullyDeclaredIds].sort(), parameterizedPatterns.map((pattern) => pattern.id).sort());

  const allEntries = parameterizedPatterns.flatMap((pattern) => Object.entries(pattern.implementation?.parameters ?? {}).map(([key, value]) => ({ id: pattern.id, key, value })));
  const legacyEntries = allEntries.filter(({ value }) => typeof value === "string" || typeof value === "number" || typeof value === "boolean");
  assert.equal(new Set(legacyEntries.map(({ id }) => id)).size, 0);
  assert.equal(legacyEntries.length, 0);

  const clockState = declaredParameter(patternsById.get("VS-G03")!, "clockState");
  assert.equal(clockState.kind, "runtime-input");
  assert.equal(clockState.valueType, "object");
  assert.equal(clockState.required, true);

  const progressValue = declaredParameter(patternsById.get("VS-G08")!, "progressValue");
  assert.equal(progressValue.kind, "runtime-input");
  assert.equal(progressValue.valueType, "number");
  assert.equal(progressValue.required, true);

  const teaserSequence = declaredParameter(patternsById.get("VS-C01")!, "teaserSequence");
  assert.equal(teaserSequence.kind, "runtime-input");
  assert.equal(teaserSequence.valueType, "array");
  assert.equal(teaserSequence.required, true);

  const destinationSet = declaredParameter(patternsById.get("VS-C06")!, "destinationSet");
  assert.equal(destinationSet.kind, "runtime-input");
  assert.equal(destinationSet.valueType, "array");
  assert.equal(destinationSet.required, true);

  const loopStatePair = declaredParameter(patternsById.get("VS-S04")!, "loopStatePair");
  assert.equal(loopStatePair.kind, "runtime-input");
  assert.equal(loopStatePair.valueType, "array");
  assert.equal(loopStatePair.required, true);

  const roleMetadata = declaredParameter(patternsById.get("VS-B03")!, "roleMetadata");
  assert.equal(roleMetadata.kind, "runtime-input");
  assert.equal(roleMetadata.valueType, "object");
  assert.equal(roleMetadata.required, true);
});

test("P2 implementation coverage partitions the frozen v0.1 source-audited catalog", async () => {
  const auditIds = new Set((await auditedEntries()).map((entry) => entry.id));
  const patterns = (await loadPatterns(patternsDirectory)).filter((pattern) => auditIds.has(pattern.id));
  const currentContractIds = new Set([
    ...p2ImplementationEnrichmentIds,
    ...h1ImplementationEnrichmentIds,
    ...h2ImplementationEnrichmentIds,
    ...h3ImplementationEnrichmentIds,
    ...h4ImplementationEnrichmentIds,
    ...h5ImplementationEnrichmentIds,
    ...h6ImplementationEnrichmentIds,
  ]);
  const historicalExceptionIds = new Set(["VS-T11", "VS-I04", "VS-A03"]);
  const semanticOnlyIds = new Set([
    "VS-T09", "VS-R09", "VS-R10", "VS-A07",
    "VS-B01", "VS-B04", "VS-B05", "VS-B06",
  ]);
  const groups = [currentContractIds, historicalExceptionIds, semanticOnlyIds];
  const allIds = new Set(patterns.map((pattern) => pattern.id));

  assert.equal(currentContractIds.size, 81);
  assert.deepEqual([...historicalExceptionIds].sort(), ["VS-A03", "VS-I04", "VS-T11"]);
  assert.equal(semanticOnlyIds.size, 8);
  for (let left = 0; left < groups.length; left += 1) {
    for (let right = left + 1; right < groups.length; right += 1) {
      assert.deepEqual([...groups[left]].filter((id) => groups[right].has(id)), [], `group ${left}/${right} overlap`);
    }
  }

  const coveredIds = new Set(groups.flatMap((group) => [...group]));
  assert.equal(coveredIds.size, 92);
  assert.deepEqual([...coveredIds].sort(), [...allIds].sort());

  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  for (const id of currentContractIds) {
    const pattern = patternsById.get(id);
    assert.ok(pattern, `Missing current-contract Pattern ${id}`);
    assert.ok(pattern.implementation, `${id}: implementation`);
    assert.ok((pattern.implementation.recipe?.length ?? 0) > 0, `${id}: implementation recipe`);
    assert.equal(pattern.implementation.deterministic, undefined, `${id}: deterministic must remain absent`);
    assert.equal(pattern.implementation.rendererCandidates, undefined, `${id}: renderer candidates must remain absent`);
    assert.ok(pattern.evidence.some((evidence) => (
      evidence.type === "proposal"
      && evidence.confidence === 0.5
      && evidence.source === undefined
      && evidence.scope.includes("implementation")
    )), `${id}: implementation proposal evidence`);
  }

  for (const id of semanticOnlyIds) {
    const pattern = patternsById.get(id);
    assert.ok(pattern, `Missing semantic-only Pattern ${id}`);
    for (const field of ["visual", "audio", "timing", "implementation"] as const) {
      assert.equal(Object.hasOwn(pattern, field), false, `${id}: ${field} must remain absent`);
    }
  }
});

test("current catalog status partition includes the post-v0.1 research-derived Pattern", async () => {
  const patterns = await loadPatterns(patternsDirectory);
  const groups = [currentContractIds, historicalExceptionIds, semanticOnlyIds];
  const combined = new Set(groups.flatMap((group) => [...group]));

  assert.equal(currentContractIds.size, 82);
  assert.equal(historicalExceptionIds.size, 3);
  assert.equal(semanticOnlyIds.size, 8);
  assert.equal(combined.size, 93);
  assert.deepEqual([...combined].sort(), patterns.map((pattern) => pattern.id).sort());
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

test("all current YAML files pass schema validation", async () => {
  const results = validatePatternDocuments(await loadPatternDocuments(patternsDirectory));
  assert.equal(results.length, 93);
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
    information: 15,
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
