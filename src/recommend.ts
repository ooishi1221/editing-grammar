/** P0 contract only. Recommendation behavior is intentionally not implemented. */
export interface RecommendationRequest {
  meaning: string;
  brandOrTone?: string[];
  references?: string[];
}
