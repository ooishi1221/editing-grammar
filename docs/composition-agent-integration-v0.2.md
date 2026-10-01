# Composition Agent Integration v0.2

## Composition Pass

Run the optional Composition Pass after Pattern selection when attention,
subject priority, material priority, text priority, product identity, region
roles, or neighboring state relationships need an explicit decision. Omit it
when the baseline remains semantically correct and a change would add noise.

Pattern selection answers what editing job occurs. Composition selection answers
what receives attention and what relationships change or remain stable.

## Frame and Sequence decisions

The Agent may inspect the complete small catalog after Pattern selection:
CF-01 through CF-06, CS-01 through CS-04, and eight Text Roles. There is no
Composition Search and no automatic Pattern-to-Composition mapping.

Choose a Frame Reference for a meaningful screen relationship. Inspect
neighboring beats before adding a Sequence Reference. Sequence references
express preserve, change, release, and restore semantics; they are neither
timelines nor mandatory cut plans.

## HOLD, anti-template, and anti-randomness

CS-04 HOLD is an affirmative choice when subject relation, main regions, and
baseline framing remain useful while text or expression changes. A new
utterance alone does not require a new composition.

Do not use one application baseline for every semantic beat when a selected
person, detail, material, text, or product becomes meaningfully primary. Do
not vary composition just to make every shot different. A composition change
needs a semantic reason.

## Bindings and text states

Supply only known authored target identities to Frame target slots. Missing
required identities remain unresolved. Do not infer reacting people, products,
details, source materials, or assets.

Use text roles for function, not position:

- persistent-context
- speech-caption
- reaction-caption
- question
- answer-result
- source-proof
- product-copy
- cta

Independent text states can remain active, release, or gain priority without
implying a position, style, font, or layout change.

## Handoff boundary

Build Pattern Handoff(s) first, resolve known Pattern inputs, then build the
optional Scene Composition Handoff from explicit selections and bindings.
Attach the already-built composition object to SceneImplementationHandoff.
Pattern array order is not timeline order.

Composition and Pattern IDs stay independent. The contract does not recommend
references, infer targets, resolve conflicts, select geometry, or invent
assets. Video Harness or renderer adapters resolve platform safe areas,
typography, concrete assets, geometry, timing, animation, and execution.

CF-06 product-identity is available as a Composition Reference. The separate
Product Identity Editing Pattern remains future work; VS-I15 is not included.
