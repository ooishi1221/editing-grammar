/** P0 contract only. Runtime schema validation is intentionally not implemented. */
export interface PatternValidationResult {
  valid: boolean;
  errors: string[];
}
