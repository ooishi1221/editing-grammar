import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

type ExampleType = "pattern" | "frame" | "sequence";
type MediaType = "still" | "before-after";

interface ReferenceExample {
  id: string;
  appliesTo: { type: ExampleType; id: string };
  title: string;
  media: { type: MediaType; path: string };
  demonstrates: string[];
  doesNotDemonstrate: string[];
  provenance: { type: "synthetic" };
}

const catalogPath = fileURLToPath(new URL("../examples/reference-catalog/catalog.yaml", import.meta.url));

async function loadCatalog(): Promise<ReferenceExample[]> {
  const document = parseDocument(await readFile(catalogPath, "utf8"), {
    prettyErrors: true,
    uniqueKeys: true,
  });
  assert.equal(document.errors.length, 0, document.errors.map((error) => error.message).join("\\n"));
  return (document.toJS() as { referenceExamples: ReferenceExample[] }).referenceExamples;
}

test("reference example spike contains only the selected synthetic concepts", async () => {
  const examples = await loadCatalog();
  assert.equal(examples.length, 7);
  assert.deepEqual(
    examples.map((example) => [example.appliesTo.type, example.appliesTo.id]),
    [
      ["pattern", "VS-I05"],
      ["pattern", "VS-R02"],
      ["pattern", "VS-L03"],
      ["frame", "CF-01"],
      ["frame", "CF-02"],
      ["frame", "CF-05"],
      ["sequence", "CS-04"],
    ],
  );
  assert.equal(new Set(examples.map((example) => example.id)).size, examples.length);
});

test("reference example metadata is machine-readable and points to synthetic SVG assets", async () => {
  const examples = await loadCatalog();
  for (const example of examples) {
    assert.match(example.id, /^RE-[PFS]-[A-Z0-9-]+$/);
    assert.match(example.title, /^[a-z0-9-]+$/);
    assert.ok(["pattern", "frame", "sequence"].includes(example.appliesTo.type));
    assert.match(example.appliesTo.id, /^(VS-[A-Z]\d{2}|CF-\d{2}|CS-\d{2})$/);
    assert.ok(["still", "before-after"].includes(example.media.type));
    assert.match(example.media.path, /^assets\/[a-z0-9-]+\.svg$/);
    assert.ok(example.demonstrates.length > 0);
    assert.ok(example.doesNotDemonstrate.length > 0);
    assert.deepEqual(example.provenance, { type: "synthetic" });

    const assetPath = resolve(dirname(catalogPath), example.media.path);
    assert.equal(existsSync(assetPath), true, example.id + " asset exists");
    const svg = await readFile(assetPath, "utf8");
    assert.match(svg, /^<svg[\s>]/);
    assert.match(svg, /data-reference-example=/);
  }
});

test("before-after examples make relationship change and HOLD explicit without renderer presets", async () => {
  const examples = await loadCatalog();
  const beforeAfterIds = examples
    .filter((example) => example.media.type === "before-after")
    .map((example) => example.id);
  assert.deepEqual(beforeAfterIds, [
    "RE-P-VS-I05",
    "RE-P-VS-R02",
    "RE-F-CF-02",
    "RE-F-CF-05",
    "RE-S-CS-04",
  ]);

  const hold = examples.find((example) => example.appliesTo.id === "CS-04");
  assert.ok(hold);
  assert.ok(hold.demonstrates.some((statement) => statement.includes("remain held")));
  assert.ok(hold.demonstrates.some((statement) => statement.includes("Text state")));
  assert.ok(hold.doesNotDemonstrate.some((statement) => statement.includes("fixed duration")));
});
