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

const scopePathSyntax = /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)*$/;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scopePathExists(pattern: unknown, scope: string): boolean {
  let current = pattern;
  for (const segment of scope.split(".")) {
    if (!isRecord(current) || !Object.hasOwn(current, segment)) return false;
    current = current[segment];
  }
  return true;
}

function scopeIssues(value: unknown): PatternValidationIssue[] {
  if (!isRecord(value) || !Array.isArray(value.evidence)) return [];

  return value.evidence.flatMap((evidence, evidenceIndex) => {
    if (!isRecord(evidence) || !Array.isArray(evidence.scope)) return [];

    return evidence.scope.flatMap((scope, scopeIndex) => {
      if (typeof scope !== "string" || !scopePathSyntax.test(scope) || scopePathExists(value, scope)) return [];
      return [{
        field: `/evidence/${evidenceIndex}/scope/${scopeIndex}`,
        message: `must reference an existing field or subtree: ${scope}`,
        keyword: "scopeExists",
      }];
    });
  });
}

export function validatePattern(value: unknown): PatternValidationResult {
  const schemaValid = validateSchema(value);
  const errors = schemaValid
    ? scopeIssues(value)
    : (validateSchema.errors ?? []).map(issueFrom);
  return { valid: errors.length === 0, errors };
}

export function validatePatternDocuments(documents: LoadedPatternDocument[]): DocumentValidationResult[] {
  return documents.map((document) => ({ ...validatePattern(document.value), filePath: document.filePath, patternId: patternId(document.value) }));
}

export function isValidPattern(value: unknown): value is EditingPattern {
  return validatePattern(value).valid;
}
