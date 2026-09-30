import type { PatternCategory } from "../schema/pattern.js";
import { buildCandidateComparisons } from "./compare.js";
import { buildImplementationHandoff, type HandoffContext } from "./handoff.js";
import { loadPatternDocuments, loadPatterns } from "./load.js";
import { searchPatterns, searchPatternsV2 } from "./search.js";
import { validatePatternDocuments } from "./validate.js";

const categories = new Set<PatternCategory>([
  "captions", "reactions", "information", "layout", "transitions",
  "audio", "game_ui", "branding", "retention", "shorts",
]);

function usage(): string {
  return [
    "Usage:",
    "  editing-grammar validate",
    "  editing-grammar search <query> [--category <category>] [--limit <n>] [--mode v1|v2]",
    "  editing-grammar compare <query> [--category <category>] [--limit <n>]",
    "  editing-grammar handoff <ID> [--values <json-object>] [--context <json-object>] [--include-historical]",
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

function parseSearchArguments(args: string[]): { intent: string; category?: PatternCategory; limit?: number; mode: "v1" | "v2" } {
  const intentParts: string[] = [];
  let category: PatternCategory | undefined;
  let limit: number | undefined;
  let mode: "v1" | "v2" = "v2";

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
    } else if (argument === "--mode") {
      const value = args[++index];
      if (value !== "v1" && value !== "v2") throw new Error("--mode must be v1 or v2.");
      mode = value;
    } else if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      intentParts.push(argument);
    }
  }

  const intent = intentParts.join(" ").trim();
  if (!intent) throw new Error("Search query is required.");
  return { intent, category, limit, mode };
}

async function search(args: string[]): Promise<number> {
  const query = parseSearchArguments(args);
  const patterns = await loadPatterns();
  if (query.mode === "v2") {
    const results = searchPatternsV2(patterns, query);
    console.log(`${results.length} candidates (v2)`);
    for (const result of results) {
      console.log(`${result.id} — ${result.title} [${result.category}]`);
      console.log(`  purpose: ${result.purpose.join(" / ")}`);
      console.log(`  matched positive fields: ${result.matchedPositiveFields.join(", ")}`);
      console.log(`  positive score: ${result.positiveScore.toFixed(2)}; avoidWhen conflict: ${result.avoidWhenConflicts.length > 0 ? "yes" : "no"}`);
    }
    return 0;
  }

  const results = searchPatterns(patterns, query);
  console.log(`${results.length} candidates`);
  for (const result of results) {
    console.log(`${result.id} — ${result.title} [${result.category}]`);
    console.log(`  purpose: ${result.purpose.join(" / ")}`);
    console.log(`  matched fields: ${result.matchedFields.join(", ")}`);
  }
  return 0;
}

function parseCompareArguments(args: string[]): { intent: string; category?: PatternCategory; limit: number } {
  if (args.includes("--mode")) throw new Error("compare always uses Search v2; --mode is not supported.");
  const query = parseSearchArguments(args);
  const limit = query.limit ?? 3;
  if (limit > 5) throw new Error("compare --limit must be at most 5.");
  return { intent: query.intent, category: query.category, limit };
}

async function compare(args: string[]): Promise<number> {
  const query = parseCompareArguments(args);
  const patterns = await loadPatterns();
  const searchResults = searchPatternsV2(patterns, query);
  console.log(JSON.stringify(buildCandidateComparisons(patterns, searchResults), null, 2));
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

function parseJsonObject(value: string | undefined, option: string): Record<string, unknown> {
  if (value === undefined) throw new Error(`${option} requires a JSON object.`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${option} must be valid JSON.`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`${option} must be a JSON object.`);
  return parsed as Record<string, unknown>;
}

function parseHandoffContext(value: string | undefined): HandoffContext {
  const context = parseJsonObject(value, "--context");
  const allowedKeys = new Set(["scene", "brand", "platform"]);
  for (const [key, entry] of Object.entries(context)) {
    if (!allowedKeys.has(key)) throw new Error(`Unknown context key: ${key}`);
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) throw new Error(`Context ${key} must be a JSON object.`);
  }
  return context as HandoffContext;
}

function parseHandoffArguments(args: string[]): { id: string; suppliedValues?: Record<string, unknown>; context?: HandoffContext; includeHistoricalMetadata: boolean } {
  let id: string | undefined;
  let suppliedValues: Record<string, unknown> | undefined;
  let context: HandoffContext | undefined;
  let includeHistoricalMetadata = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--values") {
      if (suppliedValues !== undefined) throw new Error("--values may be provided once.");
      suppliedValues = parseJsonObject(args[++index], "--values");
    } else if (argument === "--context") {
      if (context !== undefined) throw new Error("--context may be provided once.");
      context = parseHandoffContext(args[++index]);
    } else if (argument === "--include-historical") {
      includeHistoricalMetadata = true;
    } else if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    } else if (id === undefined) {
      id = argument;
    } else {
      throw new Error("handoff requires exactly one Pattern ID.");
    }
  }

  if (id === undefined) throw new Error("handoff requires exactly one Pattern ID.");
  return { id, suppliedValues, context, includeHistoricalMetadata };
}

async function handoff(args: string[]): Promise<number> {
  const options = parseHandoffArguments(args);
  const pattern = (await loadPatterns()).find((candidate) => candidate.id.toUpperCase() === options.id.toUpperCase());
  if (pattern === undefined) throw new Error(`Pattern not found: ${options.id}`);
  console.log(JSON.stringify(buildImplementationHandoff(pattern, {
    suppliedValues: options.suppliedValues,
    context: options.context,
    includeHistoricalMetadata: options.includeHistoricalMetadata,
  }), null, 2));
  return 0;
}

async function run(): Promise<number> {
  const [command, ...args] = process.argv.slice(2);
  if (command === "validate" && args.length === 0) return validate();
  if (command === "search") return search(args);
  if (command === "compare") return compare(args);
  if (command === "show") return show(args);
  if (command === "handoff") return handoff(args);
  console.error(usage());
  return 1;
}

run().then((exitCode) => { process.exitCode = exitCode; }).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
