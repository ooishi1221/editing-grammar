import type { PatternCategory } from "../schema/pattern.js";
import { loadPatternDocuments, loadPatterns } from "./load.js";
import { searchPatterns } from "./search.js";
import { validatePatternDocuments } from "./validate.js";

const categories = new Set<PatternCategory>([
  "captions", "reactions", "information", "layout", "transitions",
  "audio", "game_ui", "branding", "retention", "shorts",
]);

function usage(): string {
  return [
    "Usage:",
    "  editing-grammar validate",
    "  editing-grammar search <query> [--category <category>] [--limit <n>]",
    "  editing-grammar show <ID>",
  ].join("\n");
}

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

function parseSearchArguments(args: string[]): { intent: string; category?: PatternCategory; limit?: number } {
  const intentParts: string[] = [];
  let category: PatternCategory | undefined;
  let limit: number | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--category") {
      const value = args[++index];
      if (!value || !categories.has(value as PatternCategory)) throw new Error(`Invalid category: ${value ?? "<missing>"}`);
      category = value as PatternCategory;
    } else if (argument === "--limit") {
      const value = args[++index];
      const parsed = Number(value);
      if (!value || !Number.isInteger(parsed) || parsed < 1) throw new Error("--limit must be a positive integer.");
      limit = parsed;
    } else if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      intentParts.push(argument);
    }
  }

  const intent = intentParts.join(" ").trim();
  if (!intent) throw new Error("Search query is required.");
  return { intent, category, limit };
}

async function search(args: string[]): Promise<number> {
  const query = parseSearchArguments(args);
  const results = searchPatterns(await loadPatterns(), query);
  console.log(`${results.length} candidates`);
  for (const result of results) {
    console.log(`${result.id} — ${result.title} [${result.category}]`);
    console.log(`  purpose: ${result.purpose.join(" / ")}`);
    console.log(`  matched fields: ${result.matchedFields.join(", ")}`);
  }
  return 0;
}

async function show(args: string[]): Promise<number> {
  if (args.length !== 1) throw new Error("show requires exactly one Pattern ID.");
  const id = args[0].trim().toUpperCase();
  const pattern = (await loadPatterns()).find((candidate) => candidate.id.toUpperCase() === id);
  if (!pattern) throw new Error(`Pattern not found: ${args[0]}`);
  console.log(JSON.stringify(pattern, null, 2));
  return 0;
}

async function run(): Promise<number> {
  const [command, ...args] = process.argv.slice(2);
  if (command === "validate" && args.length === 0) return validate();
  if (command === "search") return search(args);
  if (command === "show") return show(args);
  console.error(usage());
  return 1;
}

run().then((exitCode) => { process.exitCode = exitCode; }).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
