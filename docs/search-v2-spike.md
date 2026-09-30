# Search v2 Spike

## Scope

Search v2 is an experiment alongside the frozen v1 default. It scores `id`, `title`, `purpose`, `goodFor`, `tags`, and `category` separately. It never reads evidence, source metadata, or implementation fields. `avoidWhen` can apply a capped 250-point penalty only after an exact phrase, meaningful substring, or long contiguous lexical conflict; character-bigram overlap never creates a negative penalty.

## Benchmark

- **Queries:** 24
- **Evaluation depth:** Recall@5
- **v1 Recall@5:** 16/24 (66.7%)
- **v2 Recall@5:** 23/24 (95.8%)
- **Improved:** 7
- **Unchanged:** 17
- **Regressed:** 0

The seven mechanical improvements are procedure explanation, retention recap, live score state, three English tag queries, and the `brighten mood` known-limitation query. The last one reached VS-B06 only at rank 5 through weak lexical overlap, so it is not treated as evidence of reliable semantic understanding.

The remaining known limitation, 「なんかエモく終わらせたい」, misses its expected afterglow candidates in both versions. Agent-side intent reformulation remains necessary.

## Pairwise discrimination

| Boundary | v1 intended above neighbor | v2 intended above neighbor |
| --- | --- | --- |
| VS-I02 comparison / VS-L02 simultaneous view | Pass | Pass |
| VS-L02 simultaneous view / VS-I02 comparison | Pass | Pass |
| VS-T13 speech position / VS-S02 Shorts readability | Fail | Pass |
| VS-S02 Shorts readability / VS-T13 speech position | Pass | Pass |
| VS-I03 procedure / VS-G06 progress | Fail | Pass |
| VS-G06 progress / VS-I03 procedure | Pass | Pass |
| VS-I13 structured summary / VS-C05 recap | Pass | Pass |
| VS-C05 recap / VS-I13 structured summary | Fail | Pass |
| VS-E09 temporal space / VS-A03 mute music | Pass | Pass |
| VS-T02 ongoing speaker ID / VS-B03 name and role | Pass | Pass |
| VS-B03 name and role / VS-T02 ongoing speaker ID | Pass | Pass |
| VS-I08 chronology / VS-G06 current progress | Pass | Pass |
| VS-G02 live score / VS-I11 ranking | Fail | Pass |
| VS-I11 ranking / VS-G02 live score | Pass | Pass |

**Pairwise total:** v1 10/14; v2 14/14.

## Field observations

### `goodFor` helped

- VS-I03 became a top-5 candidate for a first-time procedure explanation where v1 returned no expected candidate.
- VS-C05 entered Recall@5 for a short end-of-video recap where v1 missed it.
- VS-G02 became the top candidate for a live score-state query where v1 missed it.
- VS-S02 and VS-T13 ordering improved for the Shorts readability and speech-position boundaries, even where v1 Recall@5 already succeeded.

### `avoidWhen` helped

No natural benchmark result produced a positive retrieved false candidate that also met the deliberately strict negative-match threshold. The capped penalty is covered by a direct conflict test, but it did not change Recall@5 in this benchmark. This is expected under conservative matching and is not evidence that `avoidWhen` is ready to carry more ranking weight.

### Tags helped

V2 retrieved the expected families for the English queries `afterglow`, `split-screen`, and `speaker-identification`; v1 missed all three. Tags did not provide Japanese synonym expansion and were not treated as such.

### Enrichment did not help

The natural query 「なんかエモく終わらせたい」 remained outside the dataset's lexical vocabulary. The rank-5 hit for 「画面の空気を明るくしたい」 is treated as incidental overlap, not a validated enrichment gain.

## Tag vocabulary observations

The semantic dataset has 79 unique tags and 41 singleton tags. The benchmark exposed no practical failure caused by singleton tags: reused cross-category tags supplied the tested English-family retrieval. The near-duplicate review pairs in the semantic report (`summary` / `recap`, `progress-ui` / `current-state`, `continuity` / `transition`, and `afterglow` / `pause`) did not affect this benchmark. They remain review items rather than merge candidates.

## Decision

**Recommendation: revise v2.** Keep v1 as the default. V2 shows meaningful `goodFor` and tag gains with no Recall@5 regression, but `avoidWhen` has not yet demonstrated a natural-language ranking benefit and one known lexical limitation remains. A later review should decide whether to tune the conservative conflict condition, extend the benchmark, or promote v2; this spike does neither.
