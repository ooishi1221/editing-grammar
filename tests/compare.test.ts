import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildCandidateComparisons } from "../src/compare.js";
import { loadPatterns } from "../src/load.js";
import { searchPatternsV2 } from "../src/search.js";

const patternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));
const tsxPath = fileURLToPath(new URL("../node_modules/.bin/tsx", import.meta.url));
const cliPath = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const patternsPromise = loadPatterns(patternsDirectory);

function compareCommand(...args: string[]): ReturnType<typeof spawnSync> {
  return spawnSync(tsxPath, [cliPath, "compare", "二つを同じ軸で比較したい", ...args], {
    encoding: "utf8",
  });
}

function hasForbiddenProperty(value: unknown): boolean {
  const forbidden = new Set(["winner", "recommended", "best", "fitScore", "recommendationScore", "selectionConfidence", "preferred", "verdict"]);
  if (Array.isArray(value)) return value.some(hasForbiddenProperty);
  if (value === null || typeof value !== "object") return false;
  return Object.entries(value).some(([key, nested]) => forbidden.has(key) || hasForbiddenProperty(nested));
}

test("Candidate Comparison preserves Search v2 order, rank, and retrieval score", async () => {
  const patterns = await patternsPromise;
  const results = searchPatternsV2(patterns, { intent: "同じ軸で比較", limit: 3 });
  const comparisons = buildCandidateComparisons(patterns, results);

  assert.deepEqual(comparisons.map((entry) => entry.pattern.id), results.map((result) => result.id));
  assert.deepEqual(comparisons.map((entry) => entry.rank), [1, 2, 3]);
  assert.deepEqual(comparisons.map((entry) => entry.retrieval.retrievalScore), results.map((result) => result.score));
  assert.deepEqual(comparisons.map((entry) => entry.retrieval.matchedPositiveFields), results.map((result) => result.matchedPositiveFields));
});

test("Candidate Comparison preserves Pattern decision data and provenance", async () => {
  const patterns = await patternsPromise;
  const results = searchPatternsV2(patterns, { intent: "同じ軸で比較", limit: 1 });
  const comparison = buildCandidateComparisons(patterns, results)[0];
  const pattern = patterns.find((candidate) => candidate.id === comparison.pattern.id);

  assert.ok(pattern);
  assert.deepEqual(comparison.decision.purpose, pattern.purpose);
  assert.deepEqual(comparison.decision.goodFor, pattern.goodFor);
  assert.deepEqual(comparison.decision.avoidWhen, pattern.avoidWhen);
  assert.deepEqual(comparison.decision.tags, pattern.tags);
  assert.deepEqual(comparison.provenance.evidence, pattern.evidence);
});

test("Candidate Comparison exposes VS-I15 decision data without choosing it", async () => {
  const patterns = await patternsPromise;
  const results = searchPatternsV2(patterns, { intent: "商品同定", limit: 3 });
  const comparison = buildCandidateComparisons(patterns, results).find((entry) => entry.pattern.id === "VS-I15");

  assert.ok(comparison);
  assert.equal(comparison.pattern.title, "商品同定・パックショット");
  assert.equal(comparison.pattern.category, "information");
  assert.deepEqual(comparison.decision.purpose, ["商品・パッケージを識別可能な主役として見せる"]);
  assert.deepEqual(comparison.decision.tags, ["product", "package", "pack-shot"]);
  assert.ok(comparison.provenance.evidence.some((entry) => entry.scope.includes("implementation")));
  assert.equal(hasForbiddenProperty(comparison), false);
});

test("Candidate Comparison keeps retrievalTerms in retrieval evidence, not decision semantics", async () => {
  const patterns = await patternsPromise;
  const result = searchPatternsV2(patterns, { intent: "数字を大きく", limit: 1 })[0];
  const comparison = buildCandidateComparisons(patterns, [result])[0];

  assert.equal(comparison.pattern.id, "VS-I05");
  assert.ok(comparison.retrieval.matchedPositiveFields.includes("retrievalTerms"));
  assert.equal(Object.hasOwn(comparison.decision, "retrievalTerms"), false);
});

test("Candidate Comparison fails clearly for a missing Pattern reference", async () => {
  const patterns = await patternsPromise;
  const [result] = searchPatternsV2(patterns, { intent: "同じ軸で比較", limit: 1 });

  assert.throws(
    () => buildCandidateComparisons(patterns, [{ ...result, id: "VS-UNKNOWN" }]),
    /Search result references missing Pattern: VS-UNKNOWN/,
  );
});

test("Candidate Comparison keeps only requested candidates and has no recommendation fields", async () => {
  const patterns = await patternsPromise;
  const results = searchPatternsV2(patterns, { intent: "比較", limit: 5 });
  const comparisons = buildCandidateComparisons(patterns, results.slice(0, 2));

  assert.equal(comparisons.length, 2);
  assert.equal(hasForbiddenProperty(comparisons), false);
});

test("compare CLI defaults to three valid JSON comparison records", () => {
  const result = compareCommand();
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout) as unknown[];
  assert.equal(output.length, 3);
});

test("compare CLI rejects limits above five", () => {
  const result = compareCommand("--limit", "6");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /compare --limit must be at most 5/);
});
