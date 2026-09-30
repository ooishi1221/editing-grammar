import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import type { EditingPattern } from "../schema/pattern.js";

export interface LoadedPatternDocument { filePath: string; value: unknown; }

export class PatternLoadError extends Error {
  constructor(public readonly filePath: string, message: string) {
    super(`${filePath}: ${message}`);
    this.name = "PatternLoadError";
  }
}

const defaultPatternsDirectory = fileURLToPath(new URL("../patterns/", import.meta.url));

async function yamlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.sort((a, b) => a.name.localeCompare(b.name)).map(async (entry) => {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) return yamlFiles(filePath);
    return /\.ya?ml$/i.test(entry.name) ? [filePath] : [];
  }));
  return files.flat();
}

export async function loadPatternDocuments(patternsDirectory = defaultPatternsDirectory): Promise<LoadedPatternDocument[]> {
  const files = await yamlFiles(patternsDirectory);
  return Promise.all(files.map(async (filePath) => {
    const document = parseDocument(await readFile(filePath, "utf8"), { prettyErrors: true });
    if (document.errors.length > 0) {
      throw new PatternLoadError(filePath, document.errors.map((error) => error.message).join("; "));
    }
    return { filePath, value: document.toJS() };
  }));
}

/** Loads YAML only. Runtime schema validation belongs to validate.ts. */
export async function loadPatterns(patternsDirectory = defaultPatternsDirectory): Promise<EditingPattern[]> {
  return (await loadPatternDocuments(patternsDirectory)).map((document) => document.value as EditingPattern);
}
