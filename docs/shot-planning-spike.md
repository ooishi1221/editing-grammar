# Shot Planning Layer P0 Spike

## 1. Problem

Editing Grammar can identify an editing job and describe Composition states and
semantic relationships, but it cannot express an ordered scene decision such
as “at this punchline, begin the reaction state; at this later beat, return;
then hold.” An Agent therefore has no machine-readable answer to “where does
the picture change, and why?” before a renderer timeline exists.

## 2. Current architecture gap

The P0 fixtures insert an experimental layer between Composition and a timeline:

```text
Meaning → Pattern → Composition → Shot Plan → Timeline / Renderer → Evaluator
```

The Shot Plan binds existing visual grammar to authored semantic beat IDs. It
does not own timestamp extraction, exact duration, geometry, transition
effect, crop, asset selection, renderer implementation, aesthetic ranking, or
performance prediction.

## 3. Composition Sequence overlap

Composition Sequences already describe semantic relationships:

- CS-01 describes baseline → reaction → baseline.
- CS-02 describes explanation → supporting visual → return.
- CS-04 makes composition HOLD an affirmative state.

They deliberately do not bind those relationships to ordered scene beats or
say where the temporary priority begins and ends. The fixtures show that this
is not duplicate semantics: a Shot Plan schedules existing relationships over
authored beats, while a Composition Sequence continues to define what is
preserved, changed, released, or restored.

## 4. Semantic beat boundary

An experimental semantic scene contains only:

```yaml
sceneId: reaction-demo
beats:
  - id: beat-01
    meaning: establish two-person context
    sourceRange: # optional upstream timing fact
      startMs: 0
      endMs: 2100
```

`beatId` is the planning anchor. An upstream transcript, script, or source
analysis may supply `sourceRange`; the Shot Plan neither creates nor modifies
it. Numeric-reveal has no source ranges to prove that plans do not invent
milliseconds.

## 5. Experimental Shot Plan contract

The experimental plan is intentionally small:

```yaml
planId: reaction-demo-plan
sceneId: reaction-demo
steps:
  - id: step-02
    beatId: beat-02
    decision: switch
    patternIds: [VS-R02]
    frameReferenceId: CF-02
    sequenceReferenceId: CS-01
    rationale: Reaction becomes primary at the punchline.
```

`return` additionally uses `returnToStepId`. It is explicit because it makes
the end of temporary emphasis readable to an Agent without reconstructing a
prior state. `returnToStepId` points to an earlier plan state; the referenced
Composition Sequence still supplies the relationship semantics.

## 6. Decision vocabulary

P0 uses five semantic decisions:

- `establish`: begin the scene with a named visual state;
- `switch`: begin a different visual state at this beat;
- `insert`: make temporary supporting material primary;
- `return`: restore a previously named plan state;
- `hold`: affirmatively preserve the current visual state.

`establish` is necessary because the first beat has no prior state to hold or
switch from. `switch`, rather than `cut`, means the next visual state begins at
the semantic boundary. It will usually become a shot/cut decision, but a
renderer remains free to realize it without mandating a hard cut.

Every decision has a rationale. The vocabulary contains no zoom, pan, wipe,
crop, scale, or transition expression.

## 7. Reaction fixture

[`reaction.yaml`](../examples/shot-planning-spike/fixtures/reaction.yaml) has
four beats with upstream source ranges:

1. establish CF-01 group baseline;
2. switch to CF-02 with VS-R02 and CS-01 at the punchline;
3. return to the step-01 baseline through CS-01;
4. HOLD the returned baseline through CS-04 while conversation continues.

Only two between-state changes are justified across four adjacent beats:
switch and return. The fourth beat does not create a variety cut.

## 8. Numeric reveal fixture

[`numeric-reveal.yaml`](../examples/shot-planning-spike/fixtures/numeric-reveal.yaml)
contains four semantic beats without source ranges:

1. establish the explanatory speaker context with CF-02;
2. switch to CF-05 text-dominant-over-context using VS-I05;
3. HOLD through CS-04 while explanation continues;
4. HOLD again while copy updates without a new attention relationship.

The plan makes numeric emphasis start at beat-02 and makes subsequent
stability visible, without inventing any timing values.

## 9. Supporting material fixture

[`supporting-material.yaml`](../examples/shot-planning-spike/fixtures/supporting-material.yaml)
uses VS-L03 and CS-02:

1. establish speaker context with CF-02;
2. insert CF-04 material-with-secondary-person when authored evidence becomes useful;
3. return to step-01 speaker context when the explanation resumes.

The insert and return specify their beat boundaries and reasons without
duplicating the material/speaker relationship defined by CF-04 and CS-02.

## 10. HOLD and anti-overcut behavior

HOLD is a first-class Shot Plan decision only for scheduling: it says the
current visual state remains correct at this beat. CS-04 remains the semantic
authority for what may change while composition holds. Referencing CS-04 from a
HOLD step keeps one source of truth for preservation semantics.

The reaction fixture proves the anti-overcut case: four semantic beats do not
become four new visual states. The numeric fixture proves that state/copy may
continue across two adjacent beats without an unnecessary switch.

## 11. Composition reference reuse

The plans reuse existing IDs rather than restating their meanings:

- Patterns: VS-R02, VS-I05, VS-L03.
- Frames: CF-01, CF-02, CF-04, CF-05.
- Sequences: CS-01, CS-02, CS-04.

This P0 references Frame Reference IDs rather than scene-specific Frame
Selection IDs. That makes the examples portable, but it cannot bind an actual
selected target such as `guest` to a plan step.

There is a second limitation: `SceneCompositionHandoff.sequenceSelections`
has no stable authored selection ID. A plan can cite CS-01 or CS-04, but cannot
unambiguously identify one of multiple selected instances of the same sequence
reference. The spike does not change that production contract.

## 12. Timeline / renderer boundary

Shot Plans give a Harness the ordered beat-to-state decision. The Harness owns
actual beat timestamps, shot duration, hard cut versus motion realization,
geometry, crop, typography, assets, and rendering. The Evaluator remains
unchanged; it still verifies separately authored execution constraints after
the renderer emits metadata.

## 13. Agent explanation comparison

With Pattern and Composition definitions alone, an Agent can explain that
CS-01 permits a baseline/reaction/baseline relationship and that CS-04 permits
a HOLD. It cannot state which authored beat starts the reaction, where the
return occurs, or whether a later beat is an intentional HOLD.

With the P0 plans, the Agent can project each ordered step as “Beat 02: switch
to guest reaction because the punchline changes attention” and “Beat 04: hold
because the conversation adds no new relationship.” The fixtures therefore
materially improve the explanation of state start, temporary emphasis end, and
non-change. They do not establish that one plan is aesthetically superior.

## 14. Limitations

This is an experimental YAML convention, not a production schema, API, CLI,
or renderer contract. It does not validate target bindings, support multiple
candidate plans, rank plans, own timestamps, or identify exact Composition
Sequence selections. The three plans use one authored alternative each; a
future model may support multiple Agent-proposed plans without adding a winner
field.

## 15. Final architecture decision

**A — add a distinct Shot Planning Layer.** The fixtures expose ordered,
beat-specific information that existing Composition Sequences intentionally do
not express: when a visual state begins, when a temporary state ends, and when
the current state is affirmatively held. This is a separate orchestration
responsibility, not an extension of renderer timing or Composition semantics.

## 16. Exact next implementation batch

Design and implement one optional production Shot Plan contract only:

- semantic-beat schema with optional upstream source ranges;
- Shot Plan schema/types/validator using `establish`, `switch`, `insert`,
  `return`, and `hold`;
- scene-level builder that validates beat order and existing Pattern/Frame IDs;
- additive stable IDs for Composition Sequence selections, or an equally stable
  explicit binding mechanism, before plans may reference a selected sequence;
- focused fixture and backward-compatibility tests.

Do not add timeline ownership, duration estimation, renderer integration,
Evaluator checks, automatic plan ranking, or a v0.3 release in that batch.
