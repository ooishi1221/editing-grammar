import { readdir, readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { ErrorObject, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import { parseDocument } from "yaml";
import type {
  CompositionCatalog,
  CompositionFrameReference,
  CompositionFrameSelection,
  CompositionSequenceReference,
  CompositionSequenceSelection,
  CompositionTextRole,
  SceneCompositionHandoff,
  SceneCompositionInput,
} from "../schema/composition.js";

const schemaId = "https://github.com/ooishi1221/editing-grammar/schema/composition.schema.json";
const schema = JSON.parse(readFileSync(new URL("../schema/composition.schema.json", import.meta.url), "utf8")) as object;
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js").default as typeof import("ajv/dist/2020.js").Ajv2020;
const addFormats = require("ajv-formats").default as FormatsPlugin;
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(schema);

const validateFrameReference = ajv.compile({ $ref: schemaId + "#/$defs/frameReference" });
const validateSequenceReference = ajv.compile({ $ref: schemaId + "#/$defs/sequenceReference" });
const validateTextRoleCatalog = ajv.compile({ $ref: schemaId + "#/$defs/textRoleCatalog" });
const validateSceneInput = ajv.compile({ $ref: schemaId + "#/$defs/sceneCompositionInput" });

const defaultCompositionDirectory = fileURLToPath(new URL("../composition/", import.meta.url));

export class CompositionLoadError extends Error {
  constructor(public readonly filePath: string, message: string) {
    super(filePath + ": " + message);
    this.name = "CompositionLoadError";
  }
}

function copyValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((entry) => copyValue(entry)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, copyValue(entry)])) as T;
  }
  return value;
}

function errorMessage(errors: ErrorObject[] | null | undefined): string {
  return (errors ?? []).map((error) => {
    const missing = error.keyword === "required" && typeof error.params.missingProperty === "string"
      ? "/" + error.params.missingProperty
      : "";
    return (error.instancePath || "/") + missing + " " + (error.message ?? "schema validation failed");
  }).join("; ");
}

function assertSchema(validator: ValidateFunction, value: unknown, label: string): void {
  if (!validator(value)) throw new Error(label + ": " + errorMessage(validator.errors));
}

async function parseYaml(filePath: string): Promise<unknown> {
  const document = parseDocument(await readFile(filePath, "utf8"), { prettyErrors: true, uniqueKeys: true });
  if (document.errors.length > 0) {
    throw new CompositionLoadError(filePath, document.errors.map((error) => error.message).join("; "));
  }
  return document.toJS();
}

async function yamlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name))
    .map((entry) => join(directory, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

function assertUnique(values: readonly string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error("Duplicate " + label + ": " + value);
    seen.add(value);
  }
}

async function loadReferenceFiles<T>(
  directory: string,
  validator: ValidateFunction,
  expectedPrefix: "CF" | "CS",
): Promise<T[]> {
  const files = await yamlFiles(directory);
  return Promise.all(files.map(async (filePath) => {
    const value = await parseYaml(filePath);
    try {
      assertSchema(validator, value, "Invalid composition reference");
    } catch (error) {
      throw new CompositionLoadError(filePath, error instanceof Error ? error.message : String(error));
    }
    const reference = value as { id: string };
    const fileId = basename(filePath, extname(filePath));
    if (reference.id !== fileId || !reference.id.startsWith(expectedPrefix + "-")) {
      throw new CompositionLoadError(filePath, "reference ID must match filename: expected " + fileId + ", received " + reference.id);
    }
    return copyValue(value) as T;
  }));
}

/** Loads and validates the independent production composition catalog. */
export async function loadCompositionCatalog(
  compositionDirectory = defaultCompositionDirectory,
): Promise<CompositionCatalog> {
  const [frameReferences, sequenceReferences, textRoleDocument] = await Promise.all([
    loadReferenceFiles<CompositionFrameReference>(join(compositionDirectory, "frames"), validateFrameReference, "CF"),
    loadReferenceFiles<CompositionSequenceReference>(join(compositionDirectory, "sequences"), validateSequenceReference, "CS"),
    parseYaml(join(compositionDirectory, "text-roles.yaml")),
  ]);

  try {
    assertSchema(validateTextRoleCatalog, textRoleDocument, "Invalid text role catalog");
  } catch (error) {
    throw new CompositionLoadError(
      join(compositionDirectory, "text-roles.yaml"),
      error instanceof Error ? error.message : String(error),
    );
  }

  const textRoles = (textRoleDocument as { textRoles: CompositionTextRole[] }).textRoles;
  assertUnique(frameReferences.map((reference) => reference.id), "frame reference ID");
  assertUnique(sequenceReferences.map((reference) => reference.id), "sequence reference ID");
  assertUnique(textRoles.map((role) => role.id), "text role ID");

  return {
    frameReferences: copyValue(frameReferences),
    sequenceReferences: copyValue(sequenceReferences),
    textRoles: copyValue(textRoles),
  };
}

function validateSceneCompositionInput(input: SceneCompositionInput): void {
  assertSchema(validateSceneInput, input, "Invalid scene composition input");
  assertUnique(input.frameSelections.map((selection) => selection.id), "frame selection ID");
  assertUnique(input.textStates.map((state) => state.id), "text state ID");

  const frameIds = new Set(input.frameSelections.map((selection) => selection.id));
  for (const state of input.textStates) {
    if (frameIds.has(state.id)) {
      throw new Error("Scene state ID must not name both a frame selection and text state: " + state.id);
    }
  }
}

function stateIdsFor(
  frameSelections: readonly CompositionFrameSelection[],
  textStateIds: ReadonlySet<string>,
): Set<string> {
  return new Set([...frameSelections.map((selection) => selection.id), ...textStateIds]);
}

function validateSequenceStateBindings(
  selection: CompositionSequenceSelection,
  stateIds: ReadonlySet<string>,
  frameSelectionIds: ReadonlySet<string>,
): void {
  for (const [effect, ids] of Object.entries(selection.stateBindings)) {
    for (const id of ids) {
      if (!stateIds.has(id)) throw new Error("Unknown state binding for " + selection.referenceId + "." + effect + ": " + id);
    }
  }

  if (selection.referenceId === "CS-04") {
    if (!selection.stateBindings.preserve.some((id) => frameSelectionIds.has(id))) {
      throw new Error("CS-04 requires preserve to reference at least one Frame Selection.");
    }
    const changedFrame = selection.stateBindings.change.find((id) => frameSelectionIds.has(id));
    if (changedFrame !== undefined) {
      throw new Error("CS-04 change must not reference a Frame Selection: " + changedFrame);
    }
  }
}

/**
 * Builds a scene-level composition handoff from explicit Agent selections.
 * It validates references and derives unresolved required target slots only.
 */
export function buildSceneCompositionHandoff(
  catalog: CompositionCatalog,
  input: SceneCompositionInput,
): SceneCompositionHandoff {
  validateSceneCompositionInput(input);

  const frameReferences = new Map(catalog.frameReferences.map((reference) => [reference.id, reference]));
  const sequenceReferences = new Map(catalog.sequenceReferences.map((reference) => [reference.id, reference]));
  const textRoleIds = new Set(catalog.textRoles.map((role) => role.id));

  for (const state of input.textStates) {
    if (!textRoleIds.has(state.role)) throw new Error("Unknown text role: " + state.role);
  }

  const textStateIds = new Set(input.textStates.map((state) => state.id));
  const frameSelections = input.frameSelections.map((inputSelection) => {
    const reference = frameReferences.get(inputSelection.referenceId);
    if (reference === undefined) throw new Error("Unknown frame reference: " + inputSelection.referenceId);

    for (const [slot, value] of Object.entries(inputSelection.targetBindings)) {
      if (!(slot in reference.targetSlots)) {
        throw new Error("Unknown target slot for " + reference.id + ": " + slot);
      }
      if (typeof value !== "string") throw new Error("Target binding for " + reference.id + "." + slot + " must be a string.");
    }

    for (const textStateId of inputSelection.textStateIds) {
      if (!textStateIds.has(textStateId)) {
        throw new Error("Unknown text state in frame selection " + inputSelection.id + ": " + textStateId);
      }
    }

    const unresolved = Object.entries(reference.targetSlots)
      .filter(([slot, declaration]) => declaration.required && !(slot in inputSelection.targetBindings))
      .map(([slot]) => slot);

    return {
      id: inputSelection.id,
      referenceId: inputSelection.referenceId,
      targetBindings: copyValue(inputSelection.targetBindings),
      textStateIds: [...inputSelection.textStateIds],
      unresolved,
    };
  });

  const stateIds = stateIdsFor(frameSelections, textStateIds);
  const frameSelectionIds = new Set(frameSelections.map((selection) => selection.id));
  const sequenceSelections = input.sequenceSelections.map((inputSelection) => {
    if (!sequenceReferences.has(inputSelection.referenceId)) {
      throw new Error("Unknown sequence reference: " + inputSelection.referenceId);
    }
    const selection = copyValue(inputSelection);
    validateSequenceStateBindings(selection, stateIds, frameSelectionIds);
    return selection;
  });

  return {
    frameSelections,
    textStates: copyValue(input.textStates),
    sequenceSelections,
  };
}
