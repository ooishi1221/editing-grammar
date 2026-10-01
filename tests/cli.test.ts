import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFile, cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const tsxPath = fileURLToPath(new URL("../node_modules/.bin/tsx", import.meta.url));
const cliPath = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const compositionDirectory = fileURLToPath(new URL("../composition/", import.meta.url));
const compositionExamplePath = fileURLToPath(new URL("../examples/composition-builder.ts", import.meta.url));

function searchOutput(...args: string[]): string {
  const result = spawnSync(tsxPath, [cliPath, "search", "二項比較", "--limit", "1", ...args], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test("Search CLI defaults to v2", () => {
  const output = searchOutput();
  assert.match(output, /candidates \(v2\)/);
  assert.match(output, /positive score:/);
});

test("Search CLI accepts explicit v1 mode", () => {
  const output = searchOutput("--mode", "v1");
  assert.doesNotMatch(output, /candidates \(v2\)/);
  assert.doesNotMatch(output, /positive score:/);
  assert.match(output, /matched fields:/);
});

test("Search CLI accepts explicit v2 mode", () => {
  const output = searchOutput("--mode", "v2");
  assert.match(output, /candidates \(v2\)/);
  assert.match(output, /positive score:/);
});

test("validate CLI reports every production catalog", () => {
  const result = spawnSync(tsxPath, [cliPath, "validate"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /93 patterns loaded/);
  assert.match(result.stdout, /93 patterns valid/);
  assert.match(result.stdout, /6 composition frame references valid/);
  assert.match(result.stdout, /4 composition sequence references valid/);
  assert.match(result.stdout, /8 composition text roles valid/);
  assert.match(result.stdout, /0 errors/);
});

test("validate CLI rejects an invalid composition catalog", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "editing-grammar-composition-"));
  const temporaryCompositionDirectory = join(temporaryRoot, "composition");

  try {
    await cp(compositionDirectory, temporaryCompositionDirectory, { recursive: true });
    await appendFile(join(temporaryCompositionDirectory, "frames", "CF-01.yaml"), "\\nx: 100\\n");

    const result = spawnSync(
      tsxPath,
      [cliPath, "validate", "--composition-dir", temporaryCompositionDirectory],
      { encoding: "utf8" },
    );

    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.stdout, /0 errors/);
    assert.match(result.stderr, /Composition validation failed: .*CF-01\.yaml.*Invalid composition reference/);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("composition builder example executes with resolved selections", () => {
  const result = spawnSync(tsxPath, [compositionExamplePath], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const handoff = JSON.parse(result.stdout) as {
    frameSelections: { referenceId: string; unresolved: string[] }[];
    sequenceSelections: { referenceId: string }[];
  };
  assert.deepEqual(handoff.frameSelections.map((selection) => selection.referenceId), ["CF-01", "CF-02"]);
  assert.deepEqual(handoff.sequenceSelections.map((selection) => selection.referenceId), ["CS-01"]);
  assert.deepEqual(handoff.frameSelections.map((selection) => selection.unresolved), [[], []]);
});
