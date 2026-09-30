import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("pattern schema is valid JSON and declares required P0 fields", async () => {
  const schema = JSON.parse(
    await readFile(new URL("../schema/pattern.schema.json", import.meta.url), "utf8"),
  );

  assert.deepEqual(schema.required, [
    "id",
    "title",
    "category",
    "purpose",
    "description",
    "goodFor",
    "avoidWhen",
    "tags",
    "evidence",
  ]);
  assert.deepEqual(schema.properties.evidence.properties.type.enum, [
    "observed",
    "inferred",
    "proposal",
  ]);
});
