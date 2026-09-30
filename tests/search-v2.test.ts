import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadPatterns } from "../src/load.js";
import { searchPatterns, searchPatternsV2 } from "../src/search.js";

interface BenchmarkCase {
  id: string;
  query: string;
  expectedIds: string[];
  topN: number;
  category?: string;
  exact?: boolean;
  knownLimitation?: boolean;
  pairwise?: { intendedId: string; falsePositiveId: string };
}

const patternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));
const benchmarkPath = new URL("./fixtures/search-benchmark.json", import.meta.url);
const holdoutPath = new URL("./fixtures/search-v2-holdout.json", import.meta.url);
const patternsPromise = loadPatterns(patternsDirectory);

async function benchmark(): Promise<BenchmarkCase[]> {
  return JSON.parse(await readFile(benchmarkPath, "utf8")) as BenchmarkCase[];
}

async function holdout(): Promise<BenchmarkCase[]> {
  return JSON.parse(await readFile(holdoutPath, "utf8")) as BenchmarkCase[];
}

function rank(ids: string[], target: string): number {
  const index = ids.indexOf(target);
  return index < 0 ? Number.POSITIVE_INFINITY : index;
}

test("Search v2 benchmark has broad natural-language and pairwise coverage", async () => {
  const cases = await benchmark();
  assert.ok(cases.length >= 20);
  assert.equal(cases.filter((entry) => entry.pairwise !== undefined).length, 14);
  assert.ok(cases.some((entry) => entry.knownLimitation));
});

test("Search v2 preserves exact ID and title lookups", async () => {
  const cases = (await benchmark()).filter((entry) => entry.exact);
  const patterns = await patternsPromise;

  for (const entry of cases) {
    assert.equal(searchPatternsV2(patterns, { intent: entry.query, limit: entry.topN })[0]?.id, entry.expectedIds[0], entry.id);
  }
});

test("Search v2 ranks intended pairwise candidates above their documented neighbor", async () => {
  const cases = (await benchmark()).filter((entry): entry is BenchmarkCase & { pairwise: NonNullable<BenchmarkCase["pairwise"]> } => entry.pairwise !== undefined);
  const patterns = await patternsPromise;

  for (const entry of cases) {
    const ids = searchPatternsV2(patterns, { intent: entry.query, limit: 92 }).map((result) => result.id);
    assert.ok(rank(ids, entry.pairwise.intendedId) < rank(ids, entry.pairwise.falsePositiveId), entry.id);
  }
});

test("Search v2 keeps avoidWhen as conflict metadata without subtracting from score", async () => {
  const patterns = await patternsPromise;
  const results = searchPatternsV2(patterns, { intent: "二項比較で二者の反応を同時に見せたい", limit: 92 });
  const comparison = results.find((result) => result.id === "VS-I02");
  const layout = results.find((result) => result.id === "VS-L02");

  assert.ok((comparison?.avoidWhenConflicts.length ?? 0) > 0);
  assert.equal(layout?.avoidWhenConflicts.length, 0);
  assert.equal(comparison?.score, comparison?.positiveScore);
});

test("Search v2 exposes semantic field matches for English tag queries", async () => {
  const patterns = await patternsPromise;
  const results = searchPatternsV2(patterns, { intent: "split-screen", limit: 5 });

  assert.ok(results.some((result) => ["VS-L02", "VS-L07", "VS-S03"].includes(result.id)));
  assert.ok(results.some((result) => result.matchedPositiveFields.includes("tags")));
});

test("Search v1 remains independently available for the benchmark", async () => {
  const patterns = await patternsPromise;
  const entry = (await benchmark()).find((candidate) => candidate.id === "exact-title");
  assert.ok(entry);
  assert.equal(searchPatterns(patterns, { intent: entry.query, limit: entry.topN })[0]?.id, "VS-I02");
});

test("Search v2 holdout fixture has two cases in every catalog category", async () => {
  const cases = await holdout();
  assert.ok(cases.length >= 20);
  const counts = new Map(cases.map((entry) => [entry.category, 0]));
  for (const entry of cases) counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);

  for (const category of ["captions", "reactions", "information", "layout", "transitions", "audio", "game_ui", "branding", "retention", "shorts"]) {
    assert.ok((counts.get(category) ?? 0) >= 2, category);
  }
});

test("Search v2 ranks intended holdout pairwise candidates above their neighbor", async () => {
  const patterns = await patternsPromise;
  const cases = (await holdout()).filter((entry): entry is BenchmarkCase & { pairwise: NonNullable<BenchmarkCase["pairwise"]> } => entry.pairwise !== undefined);

  for (const entry of cases) {
    const ids = searchPatternsV2(patterns, { intent: entry.query, limit: 92 }).map((result) => result.id);
    assert.ok(rank(ids, entry.pairwise.intendedId) < rank(ids, entry.pairwise.falsePositiveId), entry.id);
  }
});

test("Search v2 preserves exact ID and title results after avoidWhen revision", async () => {
  const patterns = await patternsPromise;
  const exactCases = (await benchmark()).filter((entry) => entry.exact);

  for (const entry of exactCases) {
    assert.equal(searchPatternsV2(patterns, { intent: entry.query, limit: entry.topN })[0]?.id, entry.expectedIds[0], entry.id);
  }
});
