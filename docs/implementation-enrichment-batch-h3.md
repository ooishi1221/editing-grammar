# P2 Implementation Enrichment — Batch H3

Batch H3 adds renderer-neutral proposal guidance to twelve information Patterns. The records accept supplied facts and structure them for presentation; they do not infer, calculate, select, or validate the underlying information.

| Pattern | Fields added | Structural behavior | External data / context | Omitted Taste / renderer details | Schema friction |
| --- | --- | --- | --- | --- | --- |
| VS-I01 | visual, timing, implementation | Associate a term with a bounded definition at its first relevant use. | Term, definition, and first-use decision. | Card treatment and display timing. | None. |
| VS-I03 | visual, implementation | Preserve the order, dependencies, and correspondence of supplied steps. | Steps and dependencies. | Diagram style. | None. |
| VS-I05 | visual, timing, implementation | Present one selected value as a distinct beat while retaining its claim association. | Value, units, and claim context. | Scale and motion treatment. | None. |
| VS-I06 | visual, implementation | Map supplied comparable values to one shared scale with label correspondence. | Data, units, and scale domain. | Chart and axis styling. | None. |
| VS-I07 | visual, implementation | Preserve tabular rows and columns while keeping exact values inspectable. | Table data, sorting, and hierarchy. | Table style and pagination policy. | None. |
| VS-I08 | visual, implementation | Preserve chronological order and event-to-time correspondence. | Events, timestamps, and chronology scale. | Axis style. | None. |
| VS-I09 | visual, timing, implementation | Bind an annotation to a supplied target while preserving both visibility and association. | Target identity or coordinates and annotation content. | Arrow and enclosure appearance. | None. |
| VS-I10 | visual, implementation | Preserve location identity and the supplied route order between locations. | Geographic data, route, projection, and map source. | Provider and map style. | None. |
| VS-I11 | visual, implementation | Preserve a supplied ranking and candidate-to-rank correspondence. | Ranking rule, tie policy, and ranked data. | Ranking presentation style. | None. |
| VS-I12 | visual, implementation | Keep quote and narrator layers distinct and bind attribution to the quote. | Quote, attribution or source, and hierarchy. | Quote-card appearance. | None. |
| VS-I13 | visual, implementation | Keep supplied key points independently scannable while preserving order and grouping. | Point selection and order. | Bullet style. | None. |
| VS-I14 | visual, implementation | Bind a source or condition to its claim and preserve applicability scope. | Source text, conditions, and legal or editorial wording. | Placement and disclosure style. | None. |

## Review

The current schema is sufficient. `visual` carries structural associations and correspondence, `timing` marks authored information beats, and `implementation.recipe` with portable parameters describes the data-to-structure handoff.

Recurring parameters are `claimId` for the claim receiving a value or condition, `sourceReference` / `attribution` for supplied provenance, `eventSequence` / `stepSequence` / `routeSequence` for externally ordered data, and `dataSeries` / `tableData` / `rankingData` for externally prepared datasets. `termId`, `valueId`, `annotationTarget`, `locationSet`, `quoteId`, `keyPointList`, and `conditionSet` are specific structural inputs.

No recipe felt forced. The only recurrent responsibility boundary is that the grammar must preserve supplied facts and relationships, while the Agent or application remains responsible for selecting content, defining terms, computing values, ordering events, calculating rankings, and determining source or legal applicability. No Pattern needs reclassification.
