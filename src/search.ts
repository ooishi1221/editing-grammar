/** P0 contract only. Search behavior is intentionally not implemented. */
export interface PatternSearchQuery {
  intent: string;
  categories?: string[];
  tags?: string[];
}
