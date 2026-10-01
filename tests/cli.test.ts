import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFile, cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const tsxPath = fileURLToPath(new URL("../node_modules/.bin/tsx", import.meta.url));
const cliPath = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const compositionDirectory = fileURLToPath(new URL("../composition/", import.meta.url));
const compositionExamplePath = fileURLToPath(new URL("../examples/composition-builder.ts", import.meta.url));
const evaluatorFixturePath = fileURLToPath(new URL("fixtures/evaluator/vertical-short-mixed.yaml", import.meta.url));

function searchOutput(...args: string[]): string {
  const result = spawnSync(tsxPath, [cliPath, "search", "二項比較", "--limit", "1", ...args], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

function evaluateCli(inputFile: string) {
  return spawnSync(tsxPath, [cliPath, "evaluate", inputFile], { encoding: "utf8" });
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

test("evaluate CLI emits the canonical mixed result as JSON and exits one for failures", () => {
  const result = evaluateCli(evaluatorFixturePath);
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.stderr, "");
  const evaluation = JSON.parse(result.stdout) as {
    checks: { id: string; expectationId: string; status: string }[];
    hasFailures: boolean;
  };
  assert.equal(evaluation.hasFailures, true);
  assert.deepEqual(
    evaluation.checks.map((check) => [check.id, check.expectationId, check.status]),
    [
      ["E03", "caption-avoids-guest", "fail"],
      ["E05", "caption-inside-short-safe-area", "pass"],
      ["E07", "hold-reaction-frame", "pass"],
    ],
  );
});

test("evaluate CLI exits zero when an input has no failures", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "editing-grammar-evaluate-pass-"));
  const passingFixture = join(temporaryRoot, "passing.yaml");
  try {
    const source = await readFile(evaluatorFixturePath, "utf8");
    await writeFile(passingFixture, source.replace("x: 350\n        y: 1100", "x: 60\n        y: 200"));
    const result = evaluateCli(passingFixture);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.equal((JSON.parse(result.stdout) as { hasFailures: boolean }).hasFailures, false);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("evaluate CLI accepts JSON and YML input documents", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "editing-grammar-evaluate-formats-"));
  const jsonFixture = join(temporaryRoot, "fixture.json");
  const ymlFixture = join(temporaryRoot, "fixture.yml");
  try {
    const source = await readFile(evaluatorFixturePath, "utf8");
    const document = parseDocument(source, { prettyErrors: true, uniqueKeys: true });
    assert.equal(document.errors.length, 0, document.errors.map((error) => error.message).join("\n"));
    await writeFile(jsonFixture, JSON.stringify(document.toJS()));
    await writeFile(ymlFixture, source);

    assert.equal(evaluateCli(jsonFixture).status, 1);
    assert.equal(evaluateCli(ymlFixture).status, 1);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("evaluate CLI returns exit two and concise stderr for expected input errors", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "editing-grammar-evaluate-invalid-"));
  try {
    const invalidYaml = join(temporaryRoot, "invalid.yaml");
    const unsupported = join(temporaryRoot, "fixture.txt");
    const invalidComposition = join(temporaryRoot, "composition.yaml");
    const invalidMetadata = join(temporaryRoot, "metadata.yaml");
    const source = await readFile(evaluatorFixturePath, "utf8");
    await writeFile(invalidYaml, "selectedComposition: [broken");
    await writeFile(unsupported, source);
    await writeFile(invalidComposition, source.replace("referenceId: CF-02", "referenceId: CF-99"));
    await writeFile(invalidMetadata, source.replace("width: 380", "width: -1"));

    const cases = [
      { result: evaluateCli(join(temporaryRoot, "missing.yaml")), message: /Invalid evaluation input file/ },
      { result: evaluateCli(invalidYaml), message: /Invalid evaluation input file/ },
      { result: evaluateCli(unsupported), message: /Unsupported evaluation input extension/ },
      { result: evaluateCli(invalidComposition), message: /Invalid selected composition/ },
      { result: evaluateCli(invalidMetadata), message: /Evaluator input error/ },
    ];
    for (const { result, message } of cases) {
      assert.equal(result.status, 2);
      assert.equal(result.stdout, "");
      assert.match(result.stderr, message);
      assert.doesNotMatch(result.stderr, /\n\s+at\s/);
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
