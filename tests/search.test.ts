import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { PatternCategory } from "../schema/pattern.js";
import { loadPatterns } from "../src/load.js";
import { searchPatterns } from "../src/search.js";

const patternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));
const patternsPromise = loadPatterns(patternsDirectory);

async function resultIds(intent: string, limit = 5, category?: PatternCategory): Promise<string[]> {
  return searchPatterns(await patternsPromise, { intent, limit, category }).map((result) => result.id);
}

function includesOneOf(ids: string[], expected: string[]): void {
  assert.ok(expected.some((id) => ids.includes(id)), `Expected one of ${expected.join(", ")} in ${ids.join(", ")}`);
}

test("exact ID lookup normalizes Latin case, width, and punctuation", async () => {
  assert.equal((await resultIds("ＶＳ－Ｒ０１"))[0], "VS-R01");
});

test("exact title lookup ranks the matching Pattern first", async () => {
  assert.equal((await resultIds("二項比較"))[0], "VS-I02");
});

test("retrieves an emphasis candidate from lexical title and purpose matches", async () => {
  includesOneOf(await resultIds("重要語を一瞬強調したい"), ["VS-R01", "VS-A01", "VS-T11"]);
});

test("retrieves a comparison candidate", async () => {
  includesOneOf(await resultIds("二つの案を比較したい"), ["VS-I02", "VS-L07"]);
});

test("retrieves a conversation-transition candidate", async () => {
  includesOneOf(await resultIds("会話の間を自然につなぎたい"), ["VS-E02"]);
});

test("retrieves a Shorts subtitle candidate", async () => {
  includesOneOf(await resultIds("Shortsで字幕を追いやすくしたい"), ["VS-S02"]);
});

test("retrieves an afterglow candidate", async () => {
  includesOneOf(await resultIds("余韻を作りたい"), ["VS-T09", "VS-E06", "VS-A07"]);
});

test("retrieves a countdown candidate", async () => {
  includesOneOf(await resultIds("残り時間を見せたい"), ["VS-G03"]);
});

test("retrieves an important-number candidate", async () => {
  includesOneOf(await resultIds("重要な数値を見せたい"), ["VS-I05"]);
});

test("retrieves a speaker-identification candidate from catalog wording", async () => {
  includesOneOf(await resultIds("話者を識別したい"), ["VS-T02"]);
});

test("retrieves a map-route candidate", async () => {
  includesOneOf(await resultIds("場所と移動経路を説明したい"), ["VS-I10"]);
});

test("retrieves an end-screen candidate", async () => {
  includesOneOf(await resultIds("次の動画へ誘導したい"), ["VS-C06"]);
});

test("category filtering limits candidates to that category", async () => {
  const results = searchPatterns(await patternsPromise, { intent: "比較", category: "information", limit: 8 });
  assert.ok(results.length > 0);
  assert.ok(results.every((result) => result.category === "information"));
});
