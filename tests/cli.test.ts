import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const tsxPath = fileURLToPath(new URL("../node_modules/.bin/tsx", import.meta.url));
const cliPath = fileURLToPath(new URL("../src/cli.ts", import.meta.url));

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
