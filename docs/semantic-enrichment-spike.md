# P1 Semantic Enrichment Spike

## Scope

This spike enriches only VS-I02, VS-L02, VS-T13, VS-S02, VS-I03, VS-G06, VS-I13, and VS-C05. Tags are library `inferred` metadata; `goodFor` and `avoidWhen` are library `proposal` metadata. Source facts and source metadata remain unchanged.

## VS-I02 vs VS-L02

- **Shared surface:** Both can put two subjects before the viewer at once.
- **Decision boundary:** VS-I02 structures differences on shared criteria; VS-L02 preserves simultaneous visibility of two reactions or viewpoints.
- **Failure case:** Choosing VS-L02 when the viewer needs a criterion-based comparison leaves the comparison implicit.

## VS-T13 vs VS-S02

- **Shared surface:** Both divide spoken content into caption units.
- **Decision boundary:** VS-T13 tracks the current position within an utterance; VS-S02 prioritizes brief readable units on a small vertical screen.
- **Failure case:** Choosing VS-T13 when short-screen readability is primary makes the caption behavior more granular than needed.

## VS-I03 vs VS-G06

- **Shared surface:** Both show ordered stages.
- **Decision boundary:** VS-I03 explains how to perform a procedure; VS-G06 shows the current state of an ongoing project or challenge.
- **Failure case:** Choosing VS-G06 to teach a procedure communicates location without explaining the required actions.

## VS-I13 vs VS-C05

- **Shared surface:** Both revisit multiple important points.
- **Decision boundary:** VS-I13 organizes points for reference; VS-C05 reinforces understanding as a retention-oriented recap.
- **Failure case:** Choosing VS-C05 when viewers need a structured reference makes the relationships among points harder to inspect.
