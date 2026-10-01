# Search v2 Retrieval Access v0.2

Baseline: `c94efb4b6ccf2e244d034a8c2a38458d33a9b426`

## Purpose

`retrievalTerms` is optional, Pattern-owned lexical vocabulary for deterministic
Search v2. It improves access to an existing Pattern without changing that
Pattern's purpose, tags, or decision semantics. It is not a global synonym
dictionary, query expansion layer, recommendation signal, or semantic model.

Each term list is bounded to one through five unique non-empty strings and has
proposal provenance scoped to `retrievalTerms`. Search v2 scores this field
below `goodFor` and independently reports it in `matchedPositiveFields`.
Candidate Comparison retains `purpose`, `goodFor`, `avoidWhen`, and tags as
decision data; a retrieval-term match only explains lexical discovery.

## Bounded initial vocabulary

| Pattern | Retrieval purpose |
| --- | --- |
| VS-I05 | Numeric emphasis phrased as making a number large, emphasized, or noticeable |
| VS-R05 | Repeating a decisive action or important moment |
| VS-I08 | Following events in chronological order |
| VS-C04 | Asking viewers to write or comment an answer |
| VS-B01 | Making the publisher or sender of a video identifiable |

No terms were added for broad colloquial ending language such as `エモい`.
That remains an Agent-side reformulation case.

## Frozen-fixture results

Recall counts treat a case as found when any expected Pattern appears in the
stated top-N. These fixtures are regression checks, not population estimates.

| Fixture | Before Recall@3 | After Recall@3 | Before Recall@5 | After Recall@5 | Before / after pairwise |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original benchmark (24 cases) | 22/24 | 22/24 | 23/24 | 23/24 | 14/14 → 14/14 |
| Frozen holdout (20 cases) | 15/20 | 18/20 | 16/20 | 20/20 | 5/5 → 5/5 |

The original benchmark fixtures were unchanged. All non-known-limitation
targets remain within their frozen top-N, and all 14 pairwise boundaries remain
correct.

## Access changes

| Case | Before rank | After rank |
| --- | ---: | ---: |
| VS-I05 — `数字を大きく` | not returned | 1 |
| VS-R05 — repeat-decisive-moment | 38 | 1 |
| VS-I08 — chronological-story | 15 | 3 |
| VS-C04 — prompt-specific-comments | 11 | 5 |
| VS-B01 — publisher-identity | 6 | 1 |

## Boundary

`retrievalTerms` says only why Search can lexically find a Pattern. It does not
state why that Pattern is editorially correct in a scene. The Agent still
reformulates ambiguous intent, compares candidates, makes the selection, and
does not treat rank as a recommendation.
