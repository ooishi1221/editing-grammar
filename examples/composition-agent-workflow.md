# Composition Agent workflow

Use Composition after an Agent has selected any Editing Patterns that fit the
scene's editing job. Pattern and Composition selection are independent.

For an executable source-level builder example, run
`npx tsx examples/composition-builder.ts`. It demonstrates
`loadCompositionCatalog` and `buildSceneCompositionHandoff` without
selecting a Pattern or renderer geometry.

## Dialogue and short-form sequence

| Beat | Agent decision |
| --- | --- |
| 1. Two-person conversation | Keep the related people readable together with CF-01 group-baseline. Choose any dialogue Pattern that fits the actual editing job. |
| 2. One participant reacts strongly | VS-R02 may be an illustrative Pattern candidate if the reaction needs emphasis. Select CF-02 selected-person-reaction only when that participant should become primary. Bind selectedSubject = guest. Use CS-01 to state that the shared relationship can return. |
| 3. Shared conversation resumes | Restore the CF-01 baseline relationship through CS-01. This does not require a third cut. |
| 4. Next line changes only caption and facial state | Use CS-04 HOLD when the subject relationship and baseline framing still communicate the meaning. Change a speech-caption text state without changing the Frame Selection. |

VS-R02 is illustrative; it is not automatically bound to CF-02. A reaction may
remain in a held composition when the wider relationship still carries the
meaning.

## Text becomes primary

For a reaction line or punchline, an Agent may select VS-T08 or another Pattern
based on the actual meaning, then select CF-05 text-dominant-over-context when
text itself becomes the primary information. The person or existing visual
context may remain visible. CF-05 does not require a reframe or character
disappearance.

## Material becomes primary

When a speaker explains evidence:

~~~text
speaker/explanation
→ authored screenshot or detail
→ explanation context
~~~

Use CF-03 for a contextual detail, or CF-04 when the material remains primary
with a speaker/reaction secondary. CS-02 can preserve correspondence and state
the return relationship. Bind a known material identity such as
detailTarget = screenshot-01 and sourceContext = claim-03; do not invent the
screenshot or its relationship to the claim.

## Product identity

Use CF-06 product-identity only when an exact supplied product or package must
remain identifiable. Bind its known productIdentity; a missing identity stays
unresolved. This is a Composition Reference. VS-I15 商品同定・パックショット
independently expresses the editorial job when exact product identification is
required. Neither selection automatically requires the other.

## Boundary

The Agent supplies selected references, authored target identities, text roles,
and preserve/change/release/restore state relations. Video Harness or a
renderer adapter supplies assets, geometry, fonts, safe areas, timing, and
execution. Do not use Pattern order as timeline order.
