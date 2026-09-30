import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import type { EditingPattern } from "../schema/pattern.js";
import type { LoadedPatternDocument } from "./load.js";

const schema = JSON.parse(readFileSync(new URL("../schema/pattern.schema.json", import.meta.url), "utf8")) as object;
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js").default as typeof import("ajv/dist/2020.js").Ajv2020;
const addFormats = require("ajv-formats").default as FormatsPlugin;
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema: ValidateFunction = ajv.compile(schema);

export interface PatternValidationIssue { field: string; message: string; keyword: string; }
export interface PatternValidationResult { valid: boolean; errors: PatternValidationIssue[]; }
export interface DocumentValidationResult extends PatternValidationResult { filePath: string; patternId: string; }

function issueFrom(error: ErrorObject): PatternValidationIssue {
  const missingProperty = error.keyword === "required" && typeof error.params.missingProperty === "string" ? error.params.missingProperty : undefined;
  return {
    field: missingProperty ? `${error.instancePath}/${missingProperty}` : error.instancePath || "/",
    message: error.message ?? "schema validation failed",
    keyword: error.keyword,
  };
}

function patternId(value: unknown): string {
  if (typeof value === "object" && value !== null && "id" in value && typeof value.id === "string" && value.id.length > 0) return value.id;
  return "<missing id>";
}

export function validatePattern(value: unknown): PatternValidationResult {
  const valid = validateSchema(value);
  return { valid, errors: valid ? [] : (validateSchema.errors ?? []).map(issueFrom) };
}

export function validatePatternDocuments(documents: LoadedPatternDocument[]): DocumentValidationResult[] {
  return documents.map((document) => ({ ...validatePattern(document.value), filePath: document.filePath, patternId: patternId(document.value) }));
}

export function isValidPattern(value: unknown): value is EditingPattern {
  return validatePattern(value).valid;
}
