# Composition Production Contract Review v0.2

## 1. Fixture result

The fixture spike validated the two-layer model without changing the 92
Editing Patterns. Six frame references and four sequence references described
reusable screen relationships across five synthetic scenes. In particular,
CF-01, CF-02, CF-03, and CF-05 were reused across genres and Pattern
combinations rather than becoming duplicates of a Pattern's editorial job.

CS-04 also made an important negative decision machine-readable: when the
context continues, holding the composition while text or expression changes is
an intentional result. It is not missing direction.

The production contract should retain that separation:

- an Editing Pattern says why an edit is useful;
- a frame reference says what receives attention and how screen relationships
  are organized;
- a sequence reference says which composition states are preserved, changed,
  released, or restored as meaning changes; and
- a renderer resolves geometry and execution.

The production catalog must be derived from the fixture evidence, not treated
as a list of visual presets.

## 2. Production ownership model

**Decision A is recommended:** independent, reusable Frame and Sequence
Reference catalogs, with optional scene-level Composition Selection in the
handoff.

References belong outside Pattern YAML because the same composition can serve
different editing jobs, and one Pattern can legitimately appear with different
compositions. CF-05, for example, can accompany VS-T08, VS-T11, or VS-I05
without making those Patterns synonyms. A scene selection binds a reusable
reference to its authored subjects, materials, and text states.

Pattern YAML should not receive compositionReferenceIds in the first
production batch. Such links would imply a preferred or exhaustive mapping
where the evidence shows many-to-many reuse. An Agent may select both a Pattern
and a reference, but neither choice automatically selects the other.

## 3. Frame Reference contract

The following is the smallest production definition proposed for a frame
reference. Relation values are stable, kebab-case semantic IDs defined by the
catalog entry. They are not renderer geometry or a large global enum.

| Fixture field | Production decision | Reason |
| --- | --- | --- |
| id | keep | Stable catalog and handoff identity. |
| label | keep | Human-readable catalog label. |
| editorial_job | remove | The selected Editing Pattern owns why the edit exists. Explanatory prose belongs in catalog documentation. |
| primary_attention | rename to primaryAttention | Required semantic distinction between group, selected subject, detail, material, text, and product attention. |
| subject_relation | rename to subjectRelation | Needed to preserve participant or object relationships without geometry. |
| framing_relation | rename to framingRelation | Needed to express context-preserving, detail, closer-than-baseline, and identity-readable relations. |
| region_relation | rename to regionRelation | Needed for coherent, primary-plus-secondary, insert, and text-dominant organization. |
| text_roles | move to scene selection | A role is authored scene state; a frame only provides the relationship in which it can be used. |
| invariants | keep | Renderer-neutral constraints such as identity correspondence are part of the structural contract. |
| renderer_unresolved | remove | This was a fixture guardrail. Production omission rules and selection unresolved values make it redundant. |
| evidence | keep as CompositionEvidence[] | The reusable abstraction needs auditable support. |

Frame references also need targetSlots: a small declaration map naming the
scene identities that a reference requires. A slot has a description and a
required flag; its value is always an opaque authored identity string. This is
deliberately smaller than an implementation parameter declaration because a
slot is a composition binding, not a general renderer input.

For example, CF-02 declares a required selected-subject slot. CF-04 declares
required primary-material and secondary-subject slots. CF-06 declares a
required product-identity slot. The definition never stores the actual guest,
material, or product asset.

## 4. Sequence Reference contract

Sequence references are semantic state relationships. They are not timelines,
shot lists, Pattern orderings, or cut instructions.

The production definition needs:

- id and label;
- effects, containing preserve, change, release, and restore lists of
  composition-state aspects;
- invariants; and
- evidence.

The fixture's start_state, change_state, and end_state should not become
definition fields. They repeat an illustrative path and make a reusable
reference resemble a mandatory timeline. A scene selection instead binds the
reference's effects to explicit authored state IDs.

meaning_transition, research_relation, and applicability are useful research
and documentation material, but are not needed to execute or validate the
portable contract. Research relation IDs belong with provenance, and
explanatory transition prose belongs in catalog documentation.

The mandatory_cut field should be **removed**. All validated fixtures set it
to false because a Composition Sequence Reference has no authority to require a
cut. Keeping a boolean would invite a later true value that crosses the
Renderer and editorial boundary. No replacement authority field is needed.

## 5. Definition vs scene binding

A definition is reusable library knowledge. A selection is one authored use of
that knowledge in a scene.

~~~
Frame definition: CF-02 selected-person-reaction
  primaryAttention: selected-subject
  targetSlots: selectedSubject (required)

Scene binding:
  referenceId: CF-02
  targetBindings: selectedSubject -> guest-a
  text state: reaction-caption associated with guest-a
~~~

The actual target ID, whether a reaction caption is active, and whether a
baseline returns are scene facts. They must not be stored in the reusable
reference. Conversely, the definition's attention and relationship semantics
must not be recopied into every scene selection.

## 6. Text role decision

Use a **small reusable text-role catalog** of stable string IDs, not a schema
enum and not free-form scene strings. The initial catalog should contain only
roles proven necessary by the five fixtures: persistent-context,
speech-caption, reaction-caption, question, answer-result, source-proof,
product-copy, and cta.

The catalog gives Agents and adapters a stable semantic vocabulary while
allowing additive vocabulary changes without reopening the composition schema.
The selection records a role's active or released state and an optional target
association. It does not encode top, bottom, left, or right. Position remains
renderer/platform work.

## 7. Target binding

The recommended binding shape is deliberately small:

~~~ts
interface CompositionFrameSelection {
  id: string;
  referenceId: string;
  targetBindings: Record<string, string>;
  textStateIds: string[];
  unresolved: string[];
}
~~~

targetBindings supplies authored identity strings for slots declared by the
frame reference. The future builder validates that supplied slot keys are known
and derives unresolved from required slots that remain absent. It never detects
faces, substitutes participants, invents products, or infers assets.

This intentionally does not reuse implementation.parameters: pattern inputs
describe the structural grammar of an edit, while frame target slots describe
identity bindings for one composition use.

## 8. Sequence/state binding

A scene binds a sequence by naming the already-authored frame selections and
text states affected by each semantic effect:

~~~ts
interface CompositionSequenceSelection {
  referenceId: string;
  stateBindings: {
    preserve: string[];
    change: string[];
    release: string[];
    restore: string[];
  };
}
~~~

Each string resolves to a frame-selection or text-state ID in the same scene.
An unknown state ID is an invalid selection and should fail clearly; it is not
an unresolved asset or identity. This gives CS-01 an explicit baseline,
reaction, and restored relationship without making patterns[] array order a
timeline.

CS-04 HOLD is first-class through its reference and effects: the selection
binds the composition frame to preserve, and binds only text or expression
states to change. No frame selection appears in change. The contract thus
expresses an intentional hold without a special renderer action or a missing
visual-change field.

## 9. Handoff integration

Composition belongs only at scene level because a sequence can span multiple
Patterns and states. The additive extension is:

~~~ts
interface SceneCompositionHandoff {
  frameSelections: CompositionFrameSelection[];
  textStates: CompositionTextState[];
  sequenceSelections: CompositionSequenceSelection[];
}

interface SceneImplementationHandoff {
  patterns: ImplementationHandoff[];
  composition?: SceneCompositionHandoff;
  context: HandoffContext;
}
~~~

ImplementationHandoff remains unchanged. A caller who supplies no composition
gets the v0.1 scene handoff behavior unchanged.

The first contract should not add patternIds to a composition selection. The
current handoff represents selected Patterns by catalog ID and permits
duplicates, so an exact per-instance association would require a new selection
identity concept. The scene already contains both selected Pattern handoffs and
composition bindings. If later integration needs a deterministic per-instance
link, it should add explicit Pattern-selection IDs rather than an ambiguous
array of Pattern IDs.

Composition needs an unresolved model, but only the smaller per-frame shape:
reference targetSlots declare requirements; the selection holds supplied
targetBindings and derived unresolved. Sequence selections have no runtime
input declarations. They validate references to scene state IDs instead.

## 10. Provenance

Use a distinct CompositionEvidence shape rather than reusing PatternEvidence
unchanged:

~~~ts
type CompositionEvidence =
  | {
      type: "inferred";
      sourceIds: string[];
      observationIds: string[];
      researchRelationIds?: string[];
    }
  | { type: "proposal"; rationale: string };
~~~

The initial six frame and four sequence references have inferred evidence that
points to the observed source and observation IDs already recorded in research.
The production contract, its vocabulary normalization, and any future
non-observed extension are proposals. They must not be reported as source
facts.

Production references carry stable provenance IDs but do not load or dereference
the research registry at runtime. Repository validation can verify IDs while the
research corpus is present. A consumer who packages only the production catalog
still receives a valid portable contract and stable audit pointers, without a
runtime dependency on research/composition.

## 11. File / schema layout

The recommended layout keeps reference definitions separate from Pattern data
and uses one composition schema with reusable definitions:

~~~text
composition/
  frames/
    CF-01.yaml
    ...
    CF-06.yaml
  sequences/
    CS-01.yaml
    ...
    CS-04.yaml
  text-roles.yaml
schema/
  composition.schema.json
  composition.ts
~~~

composition.schema.json contains definitions for frame references, sequence
references, text-role entries, selections, target slots, and provenance. One
schema is smaller and easier to evolve than parallel schema files for the same
cross-referencing contract. composition.ts mirrors those definitions and is
used by the loader and handoff extension.

The stable public ID prefixes remain CF- and CS-. They are readable, distinct
from VS- Pattern IDs, and leave room for additive catalog entries. Research
observation and source IDs are not renumbered.

## 12. Backward compatibility

This is a **backward-compatible additive contract**.

- All 92 existing Pattern files remain unchanged and valid.
- Search and Candidate Comparison retain their current behavior.
- buildImplementationHandoff remains valid and unchanged.
- buildSceneImplementationHandoff remains valid when composition is omitted.
- An Agent may continue to use the v0.1 Pattern-only workflow.

Composition is an optional scene-level layer. It must never be required merely
because a selected Pattern has implementation grammar.

## 13. Product identity Pattern decision

**Product identity Pattern: YES**

CF-06 describes a reusable composition relationship, but the requirement to
make an exact product or package identifiable is also an independent editorial
job. It can be needed without a supporting-footage insertion, publisher mark,
or destination action.

Proposed future Pattern contract, not part of this review implementation:

| Field | Proposal |
| --- | --- |
| ID | VS-I15 |
| Title | 商品同定・パックショット |
| Category | information |
| Purpose | Make a supplied product or package identifiable as the primary item of information. |
| Good for | Product advertising, reviews, demonstrations, and transitions from use context to exact product identification. |
| Avoid when | The shot only supplies generic B-roll, identifies a publisher/channel, presents an end-state destination, or lacks a verified product asset. |
| Tags | product, package, identity, pack-shot, commercial |
| Likely implementation inputs | Required productIdentity and productAsset supplied externally; optional scene-context association if needed. |
| Evidence plan | Preserve direct observations from C01, C03, and C04 with their source records; add inferred evidence for the repeated identity relationship; keep any implementation grammar as separately scoped proposal evidence. |

Distinctness is concrete. VS-L05 controls insertion of related B-roll but does
not require an item to become identifiable. VS-B01 identifies a publisher or
channel, not a product. VS-C06 exposes end-state destinations and actions,
not the product/package itself. CF-06 remains valuable alongside VS-I15: the
Pattern explains why product identification is required, and the Frame
Reference describes how the product becomes the primary visual relationship.

## 14. Search boundary

The first composition production version needs no Composition Search. The
catalog is small enough for an Agent to inspect after selecting Pattern(s), and
automatic relation lookup would imply an unsupported recommendation policy.

Pattern Search remains responsible for plausible editing jobs. Composition
selection answers how the already-selected meaning can be framed and related.
The known query gap from "数字を大きく" to VS-I05 is a separate Search v0.2
task; it is not evidence for merging Pattern and Composition ranking.

## 15. Renderer / platform / typography boundary

Composition may express semantic relationships such as closer-than-baseline,
selected-subject, text-dominant, and primary-plus-secondary-region. It must not
encode x/y coordinates, dimensions, pixels, crop percentage, subject scale,
duration frames, animation curves, or renderer syntax.

Platform safe areas remain external platform context. A composition selection
can require that a product, subject, or text role remain important; the Video
Harness resolves where it can appear in Shorts, TikTok, X, or another output
surface.

Typography remains downstream as well. Composition can express a text role, its
persistence, and its dominance. It does not choose font family, font file,
weight, outline, shadow, line break, or placement. Brand and renderer context
make those decisions.

## 16. Rejected alternatives

**B — Frame composition embedded in each Pattern.** Rejected because fixture
reuse is many-to-many. It would duplicate CF-01, CF-02, CF-03, and CF-05 and
would turn a possible composition choice into Pattern behavior.

**C — Independent catalogs with no handoff representation.** Rejected because
the selection/binding boundary is precisely what prevents a renderer or Agent
from guessing targets and state changes. Agent-only prose would lose explicit
unresolved target state and sequence bindings.

**D — Do not proceed.** Rejected because the fixtures demonstrated reuse,
semantic HOLD, text-role separation, and geometry exclusion across dialogue,
explainer, quiz, short-form, and product scenes.

**A global geometry or layout enum.** Rejected because the evidence supports
semantic relationships, while exact layouts remain platform- and
renderer-dependent.

**A mandatory-cut control.** Rejected because sequence grammar does not own
timeline execution.

## 17. Final decision

**Decision A: Independent Frame + Sequence production catalogs, plus optional
scene-level Composition Selection in Handoff.**

The smallest non-implemented type sketch is:

~~~ts
type TextRoleId = string;

type CompositionEvidence =
  | {
      type: "inferred";
      sourceIds: string[];
      observationIds: string[];
      researchRelationIds?: string[];
    }
  | { type: "proposal"; rationale: string };

interface CompositionTargetSlot {
  description: string;
  required: boolean;
}

interface CompositionFrameReference {
  id: string;
  label: string;
  primaryAttention: string;
  subjectRelation: string;
  framingRelation: string;
  regionRelation: string;
  targetSlots: Record<string, CompositionTargetSlot>;
  invariants: string[];
  evidence: CompositionEvidence[];
}

interface CompositionSequenceReference {
  id: string;
  label: string;
  effects: {
    preserve: string[];
    change: string[];
    release: string[];
    restore: string[];
  };
  invariants: string[];
  evidence: CompositionEvidence[];
}

interface CompositionTextState {
  id: string;
  role: TextRoleId;
  targetId?: string;
  status: "active" | "released";
}

interface CompositionFrameSelection {
  id: string;
  referenceId: string;
  targetBindings: Record<string, string>;
  textStateIds: string[];
  unresolved: string[];
}

interface CompositionSequenceSelection {
  referenceId: string;
  stateBindings: {
    preserve: string[];
    change: string[];
    release: string[];
    restore: string[];
  };
}

interface SceneCompositionHandoff {
  frameSelections: CompositionFrameSelection[];
  textStates: CompositionTextState[];
  sequenceSelections: CompositionSequenceSelection[];
}
~~~

The schema should constrain object shape, required fields, ID uniqueness in
catalog loading, reference existence, and target-slot keys. It should not turn
relation strings or text-role values into a large immutable schema enum.

## 18. Exact next implementation batch

The next batch should implement only the validated initial production slice:

1. Create six production frame references from CF-01 through CF-06 and four
   sequence references from CS-01 through CS-04 in the proposed catalog.
2. Create the small initial text-role catalog used by the five fixture scenes.
3. Add composition.schema.json and composition.ts for the definitions,
   selections, provenance, and target-slot validation.
4. Add a composition catalog loader with deterministic reference validation.
5. Extend only SceneImplementationHandoff with optional
   SceneCompositionHandoff; retain all individual Pattern handoff behavior.
6. Migrate the five synthetic scene fixtures into production-contract tests,
   including unresolved required target bindings and CS-04 HOLD behavior.
7. Add the product-identity Pattern proposal only in a separately scoped
   Pattern-enrichment task after its evidence is reviewed; do not fold it into
   the composition implementation batch.

| Surface | Next batch impact |
| --- | --- |
| Composition catalog | required |
| Schema | required |
| TypeScript types | required |
| Loader | required |
| CLI | no change |
| Pattern schema | no change |
| Pattern YAML | no change |
| Search | no change |
| Compare | no change |
| Handoff | required |
| Skill | optional |
| Tests | required |

The scene-level extension must stay optional, no renderer adapter may be added,
and the fixture corpus should remain research evidence rather than become a
runtime dependency.

## Non-production scene example

The following conceptual binding uses SF-03. It is not a renderer plan and
contains no geometry or timing values.

~~~json
{
  "selectedPatternIds": ["VS-G04", "VS-G05", "VS-R02"],
  "composition": {
    "frameSelections": [
      {
        "id": "quiz-baseline",
        "referenceId": "CF-01",
        "targetBindings": { "contextSubjects": "quiz-participants" },
        "textStateIds": ["program-label", "question-panel"],
        "unresolved": []
      },
      {
        "id": "participant-a-reaction",
        "referenceId": "CF-02",
        "targetBindings": {
          "selectedSubject": "participant-a",
          "baselineContext": "quiz-participants"
        },
        "textStateIds": ["answer-result"],
        "unresolved": []
      },
      {
        "id": "result-text-priority",
        "referenceId": "CF-05",
        "targetBindings": { "context": "quiz-participants" },
        "textStateIds": ["answer-result"],
        "unresolved": []
      }
    ],
    "textStates": [
      {
        "id": "program-label",
        "role": "persistent-context",
        "status": "active"
      },
      {
        "id": "question-panel",
        "role": "question",
        "status": "released"
      },
      {
        "id": "answer-result",
        "role": "answer-result",
        "targetId": "participant-a",
        "status": "active"
      }
    ],
    "sequenceSelections": [
      {
        "referenceId": "CS-03",
        "stateBindings": {
          "preserve": ["quiz-baseline", "program-label"],
          "change": ["participant-a-reaction", "result-text-priority", "answer-result"],
          "release": ["question-panel"],
          "restore": []
        }
      }
    ]
  }
}
~~~

Product identity Pattern: YES
