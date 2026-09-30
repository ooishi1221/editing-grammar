# Search v2 Revision / Promotion Gate

## Revision

Search v2 now ranks with positive retrieval fields only: `id`, `title`, `purpose`, `goodFor`, `tags`, and `category`. `avoidWhen` no longer changes the score. It remains post-retrieval conflict metadata when a query has an exact, meaningful-substring, or long contiguous lexical conflict with an `avoidWhen` entry.

The positive-field weights are unchanged from the prior spike. Search v1 remains the default.

## Frozen holdout

`tests/fixtures/search-v2-holdout.json` contains 20 new natural-language requests: two each for captions, reactions, information, layout, transitions, audio, game UI, branding, retention, and Shorts. It includes five paraphrased decision boundaries and does not use IDs, exact titles, or copied semantic-field prose.

## Original benchmark: 24 queries

| Version | Recall@3 | Recall@5 | Pairwise |
| --- | ---: | ---: | ---: |
| v1 | 15/24 (62.5%) | 16/24 (66.7%) | 10/14 |
| Penalized v2 (documented prior baseline) | not recorded | 23/24 (95.8%) | 14/14 |
| Revised positive-only v2 | 22/24 (91.7%) | 23/24 (95.8%) | 14/14 |

Against v1, revised v2 improves seven cases, leaves 17 unchanged, and regresses none. Exact ID and exact-title queries remain first-place results. The revised scorer retains the documented penalized-v2 Recall@5 and pairwise results without using `avoidWhen` in rank.

## Holdout benchmark: 20 queries

| Version | Recall@3 | Recall@5 | Pairwise |
| --- | ---: | ---: | ---: |
| v1 | 12/20 (60.0%) | 15/20 (75.0%) | 4/5 |
| Revised positive-only v2 | 15/20 (75.0%) | 16/20 (80.0%) | 5/5 |

Against v1, revised v2 improves `quiet-speech` and `avoid-audio-discontinuity`, leaves 17 cases unchanged, and misses `publisher-identity`, which v1 returned in the top five. It also misses `repeat-decisive-moment`, `chronological-story`, and `prompt-specific-comments` in both result sets or without v2 improvement. No weights were tuned around these outcomes.

## `avoidWhen` conflict metadata

A conflict opportunity is a pairwise query whose known false-positive neighbor appears in v2's top five. The existing conservative detector found no strong lexical conflict in these natural requests.

| Dataset | Conflict opportunities | Detected | False conflict signals |
| --- | ---: | ---: | ---: |
| Original 24 | 2 | 0 | 0 |
| Holdout 20 | 1 | 0 | 0 |
| Total | 3 | 0 | 0 |

The prior direct-conflict test still confirms that a strong conflict is exposed as metadata, but these benchmarks provide no evidence for using `avoidWhen` as a retrieval-ranking penalty. Keeping it for post-retrieval comparison matches its decision-boundary role.

## Tag vocabulary observations

The 79-tag vocabulary and 41 singleton tags caused no observed holdout confusion. The existing near-duplicate review pairs (`summary` / `recap`, `progress-ui` / `current-state`, `continuity` / `transition`, and `afterglow` / `pause`) did not affect either benchmark. This is observational only; no tag vocabulary was changed.

## Known lexical limits

「なんかエモく終わらせたい」 remains outside the catalog's direct lexical vocabulary. This is an expected Agent-side intent-reformulation case, not a reason to add query synonyms or modify Pattern data.

## Recommendation

**Promote revised v2 in a separate default-switch decision.** It preserves exact behavior, exceeds v1 Recall@5 on the original and frozen holdout sets, improves pairwise discrimination, and introduces no serious false-positive pattern. The one holdout regression is documented for later review; this spike does not change the default search mode.
