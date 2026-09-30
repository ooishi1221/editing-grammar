import type { Pattern } from "../schema/pattern.js";

/** P0 contract only. Pattern-file loading is intentionally not implemented. */
export type PatternLoader = () => Promise<Pattern[]>;
