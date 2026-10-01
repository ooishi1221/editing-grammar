# Composition Production Contract v0.2

The production Composition contract adds reusable screen-relationship grammar
without changing Editing Patterns. It is an optional layer between an Agent's
scene decision and a Video Harness or renderer adapter.

## Separate reference catalogs

Frame References describe what receives attention and how subjects, materials,
text, and regions relate in one composition. Sequence References describe what
composition state is preserved, changed, released, or restored when meaning
changes. They remain separate because the same Frame Reference can support
several Patterns and genres, while a Sequence Reference can span several
frames and Pattern selections.

Definitions are reusable catalog knowledge. Scene selections supply authored
target identities and state bindings. A reference never stores a guest,
product, source asset, crop, or position.

## Target bindings and unresolved values

Each Frame Reference declares named target slots. A scene selection supplies
opaque authored string IDs for those slots. The builder derives an
unresolved list for missing required slots and leaves optional slots resolved
when absent. It rejects unknown slots, unknown references, non-string target
values, and unknown text-state references.

The builder does not detect people, choose a target, invent a product, or
resolve an asset.

## Text roles

The initial text-role catalog contains:

- persistent-context
- speech-caption
- reaction-caption
- question
- answer-result
- source-proof
- product-copy
- cta

Text roles express editorial function, persistence, and target association.
They do not encode position, font, styling, or line breaks.

## HOLD

CS-04, hold-composition-update-state-only, is an affirmative composition
state. Its selection must preserve at least one Frame Selection and may not
place a Frame Selection under change. Text states can change while the
composition remains held. This prevents a new utterance from implying an
automatic reframe.

## Scene-level Handoff

SceneImplementationHandoff now accepts optional composition:

~~~ts
{
  patterns,
  composition,
  context
}
~~~

Individual ImplementationHandoff objects are unchanged. Composition is built
and validated first with buildSceneCompositionHandoff, then passed to the
scene Handoff builder. Omitting composition preserves the v0.1 scene Handoff
shape.

Pattern selection and Composition selection are independent. The contract does
not map a Pattern to a preferred Frame Reference, infer a sequence from Pattern
order, recommend a composition, or resolve conflicts.

## Provenance

Composition references carry inferred evidence through stable source,
observation, and sequence-relation IDs. Runtime loading does not read the
research corpus. Repository tests verify those IDs against the visual research
registry so the catalog remains auditable without making research files a
consumer runtime dependency.

## Renderer boundary

The contract contains semantic relationships and authored identity bindings.
It contains no geometry, pixels, crop values, font choices, animation curves,
durations, or renderer syntax. Platform safe areas, brand typography, assets,
and concrete execution remain downstream responsibilities.

## Search and product identity

There is no Composition Search in this batch. Agents inspect the small catalog
after choosing Patterns. The known Pattern Search retrieval gap remains a
separate concern.

CF-06 product-identity is a Composition Reference only. The proposed
product-identity Pattern remains a separate future task; VS-I15 is not part of
this release.
