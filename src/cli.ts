import type { PatternCategory } from "../schema/pattern.js";
import type { SceneCompositionInput } from "../schema/composition.js";
import type {
  EvaluationContext,
  SceneEvaluationExpectations,
  SceneExecutionReport,
} from "../schema/evaluator.schema.js";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { parseDocument } from "yaml";
import { buildCandidateComparisons } from "./compare.js";
import { buildSceneCompositionHandoff, loadCompositionCatalog } from "./composition.js";
import { evaluateScene, EvaluatorInputError } from "./evaluator.js";
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
    "  editing-grammar validate [--composition-dir <path>]",
    "  editing-grammar search <query> [--category <category>] [--limit <n>] [--mode v1|v2]",
    "  editing-grammar compare <query> [--category <category>] [--limit <n>]",
    "  editing-grammar handoff <ID> [--values <json-object>] [--context <json-object>] [--include-historical]",
    "  editing-grammar show <ID>",
    "  editing-grammar evaluate <input-file>",
  ].join("\n");
}

function parseValidateArguments(args: string[]): { compositionDirectory?: string } {
  let compositionDirectory: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--composition-dir") {
      if (compositionDirectory !== undefined) throw new Error("--composition-dir may be provided once.");
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error("--composition-dir requires a path.");
      compositionDirectory = value;
    } else if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      throw new Error(`validate does not accept positional arguments: ${argument}`);
    }
  }

  return { compositionDirectory };
}

async function validate(compositionDirectory?: string): Promise<number> {
  const documents = await loadPatternDocuments();
  const results = validatePatternDocuments(documents);
  const patternErrors = results.flatMap((result) => result.errors.map((error) => `${result.patternId} (${result.filePath}) ${error.field}: ${error.message}`));
  let composition: Awaited<ReturnType<typeof loadCompositionCatalog>> | undefined;
  let compositionError: Error | undefined;

  try {
    composition = await loadCompositionCatalog(compositionDirectory);
  } catch (error) {
    compositionError = error instanceof Error ? error : new Error(String(error));
  }

  console.log(`${documents.length} patterns loaded`);
  console.log(`${results.filter((result) => result.valid).length} patterns valid`);
  if (composition !== undefined) {
    console.log(`${composition.frameReferences.length} composition frame references valid`);
    console.log(`${composition.sequenceReferences.length} composition sequence references valid`);
    console.log(`${composition.textRoles.length} composition text roles valid`);
  }
  console.log(`${patternErrors.length + (compositionError === undefined ? 0 : 1)} errors`);
  if (patternErrors.length > 0 || compositionError !== undefined) {
    for (const error of patternErrors) console.error(error);
    if (compositionError !== undefined) console.error(`Composition validation failed: ${compositionError.message}`);
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

interface EvaluationInputDocument {
  selectedComposition: SceneCompositionInput;
  expectations: SceneEvaluationExpectations;
  context: EvaluationContext;
  executionReport: SceneExecutionReport;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function readEvaluationInput(filePath: string): Promise<unknown> {
  const extension = extname(filePath).toLowerCase();
  if (extension !== ".json" && extension !== ".yaml" && extension !== ".yml") {
    throw new Error("Unsupported evaluation input extension: " + (extension || "<none>") + ". Use .json, .yaml, or .yml.");
  }

  let source: string;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    throw new Error("Invalid evaluation input file: " + (error instanceof Error ? error.message : String(error)));
  }

  if (extension === ".json") {
    try {
      return JSON.parse(source) as unknown;
    } catch {
      throw new Error("Invalid evaluation input file: invalid JSON.");
    }
  }

  const document = parseDocument(source, { prettyErrors: true, uniqueKeys: true });
  if (document.errors.length > 0) {
    throw new Error("Invalid evaluation input file: " + document.errors.map((error) => error.message).join("; "));
  }
  return document.toJS();
}

function parseEvaluationInput(value: unknown): EvaluationInputDocument {
  if (!isRecord(value)) throw new Error("Invalid evaluation input file: expected an object.");
  const requiredKeys = ["selectedComposition", "expectations", "context", "executionReport"];
  for (const key of requiredKeys) {
    if (!(key in value)) throw new Error("Invalid evaluation input file: missing " + key + ".");
  }
  for (const key of Object.keys(value)) {
    if (!requiredKeys.includes(key)) throw new Error("Invalid evaluation input file: unknown field " + key + ".");
  }
  if (!isRecord(value.selectedComposition)) throw new Error("Invalid selected composition: expected an object.");
  if (!isRecord(value.expectations)) throw new Error("Invalid evaluation expectations: expected an object.");
  if (!isRecord(value.context)) throw new Error("Invalid evaluation context: expected an object.");
  if (!isRecord(value.executionReport)) throw new Error("Invalid execution report: expected an object.");

  return value as unknown as EvaluationInputDocument;
}

function evaluationErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function evaluate(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("evaluate requires exactly one input file.");
    return 2;
  }

  let input: EvaluationInputDocument;
  try {
    input = parseEvaluationInput(await readEvaluationInput(args[0]));
  } catch (error) {
    console.error(evaluationErrorMessage(error));
    return 2;
  }

  const compositionCatalog = await loadCompositionCatalog();
  let selectedComposition;
  try {
    selectedComposition = buildSceneCompositionHandoff(compositionCatalog, input.selectedComposition);
  } catch (error) {
    console.error("Invalid selected composition: " + evaluationErrorMessage(error));
    return 2;
  }

  try {
    const result = evaluateScene({
      compositionCatalog,
      selectedComposition,
      expectations: input.expectations,
      context: input.context,
      executionReport: input.executionReport,
    });
    console.log(JSON.stringify(result, null, 2));
    return result.hasFailures ? 1 : 0;
  } catch (error) {
    const prefix = error instanceof EvaluatorInputError ? "Evaluator input error: " : "Invalid evaluation input: ";
    console.error(prefix + evaluationErrorMessage(error));
    return 2;
  }
}

async function run(): Promise<number> {
  const [command, ...args] = process.argv.slice(2);
  if (command === "validate") return validate(parseValidateArguments(args).compositionDirectory);
  if (command === "search") return search(args);
  if (command === "compare") return compare(args);
  if (command === "show") return show(args);
  if (command === "handoff") return handoff(args);
  if (command === "evaluate") return evaluate(args);
  console.error(usage());
  return 1;
}

run().then((exitCode) => { process.exitCode = exitCode; }).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
