import { loadPatternDocuments } from "./load.js";
import { validatePatternDocuments } from "./validate.js";

async function validate(): Promise<number> {
  const documents = await loadPatternDocuments();
  const results = validatePatternDocuments(documents);
  const errors = results.flatMap((result) => result.errors.map((error) => `${result.patternId} (${result.filePath}) ${error.field}: ${error.message}`));
  console.log(`${documents.length} patterns loaded`);
  console.log(`${results.filter((result) => result.valid).length} patterns valid`);
  console.log(`${errors.length} errors`);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    return 1;
  }
  return 0;
}

if (process.argv[2] !== "validate") {
  console.error("Usage: editing-grammar validate");
  process.exitCode = 1;
} else {
  validate().then((exitCode) => { process.exitCode = exitCode; }).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
