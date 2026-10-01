import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseDocument } from "yaml";
import type { SceneCompositionInput } from "../schema/composition.js";
import {
  buildSceneCompositionHandoff,
  loadCompositionCatalog,
} from "../src/composition.js";

const root = new URL("../", import.meta.url);

async function yaml<T>(path: string): Promise<T> {
  const document = parseDocument(await readFile(new URL(path, root), "utf8"), {
    prettyErrors: true,
    uniqueKeys: true,
  });
  assert.equal(document.errors.length, 0, document.errors.map((error) => error.message).join("\n"));
  return document.toJS() as T;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

async function catalog() {
  return loadCompositionCatalog();
}

function frameInput(
  id: string,
  referenceId: string,
  targetBindings: Record<string, string>,
  textStateIds: string[] = [],
) {
  return { id, referenceId, targetBindings, textStateIds };
}

test("production composition catalog loads the audited references and text roles", async () => {
  const loaded = await catalog();
  assert.deepEqual(loaded.frameReferences.map((reference) => reference.id), ["CF-01", "CF-02", "CF-03", "CF-04", "CF-05", "CF-06"]);
  assert.deepEqual(loaded.sequenceReferences.map((reference) => reference.id), ["CS-01", "CS-02", "CS-03", "CS-04"]);
  assert.deepEqual(loaded.textRoles.map((role) => role.id), [
    "persistent-context",
    "speech-caption",
    "reaction-caption",
    "question",
    "answer-result",
    "source-proof",
    "product-copy",
    "cta",
  ]);
  assert.equal(loaded.frameReferences.length, 6);
  assert.equal(loaded.sequenceReferences.length, 4);
  assert.equal(loaded.textRoles.length, 8);
});

test("production inferred provenance remains linked to visually verified research without runtime loading", async () => {
  const [loaded, sources, observations] = await Promise.all([
    catalog(),
    yaml<{ sources: { source_id: string; verification?: string }[] }>("research/composition/sources.yaml"),
    yaml<{
      observations: { observation_id: string; source_id: string }[];
      sequence_relations: { sequence_id: string }[];
    }>("research/composition/observations.yaml"),
  ]);
  const sourcesById = new Map(sources.sources.map((source) => [source.source_id, source]));
  const observationsById = new Map(observations.observations.map((observation) => [observation.observation_id, observation]));
  const sequenceRelationIds = new Set(observations.sequence_relations.map((relation) => relation.sequence_id));

  for (const reference of [...loaded.frameReferences, ...loaded.sequenceReferences]) {
    for (const evidence of reference.evidence) {
      if (evidence.type !== "inferred") continue;
      for (const sourceId of evidence.sourceIds) {
        const source = sourcesById.get(sourceId);
        assert.ok(source, reference.id + ": source " + sourceId);
        assert.equal(source.verification, "visually_verified", reference.id + ": source " + sourceId);
      }
      for (const observationId of evidence.observationIds) {
        const observation = observationsById.get(observationId);
        assert.ok(observation, reference.id + ": observation " + observationId);
        assert.ok(evidence.sourceIds.includes(observation.source_id), reference.id + ": observation source " + observation.source_id);
      }
      for (const relationId of evidence.researchRelationIds ?? []) {
        assert.ok(sequenceRelationIds.has(relationId), reference.id + ": research relation " + relationId);
      }
    }
  }
});

test("SF-01 derives dialogue reaction composition without Pattern selection", async () => {
  const handoff = buildSceneCompositionHandoff(await catalog(), {
    textStates: [
      { id: "speech", role: "speech-caption", targetId: "host", status: "active" },
      { id: "reaction", role: "reaction-caption", targetId: "guest", status: "released" },
    ],
    frameSelections: [
      frameInput("baseline", "CF-01", { contextSubjects: "host-and-guest" }, ["speech"]),
      frameInput("guest-reaction", "CF-02", { selectedSubject: "guest", baselineContext: "host-and-guest" }, ["reaction"]),
    ],
    sequenceSelections: [{
      referenceId: "CS-01",
      stateBindings: {
        preserve: ["baseline"],
        change: ["guest-reaction"],
        release: ["reaction"],
        restore: ["baseline"],
      },
    }],
  });

  assert.deepEqual(handoff.frameSelections[1].targetBindings, {
    selectedSubject: "guest",
    baselineContext: "host-and-guest",
  });
  assert.deepEqual(handoff.frameSelections.map((selection) => selection.unresolved), [[], []]);
  assert.deepEqual(handoff.sequenceSelections[0].stateBindings.restore, ["baseline"]);
  assert.equal("patterns" in handoff, false);
});

test("SF-02 preserves authored detail and material correspondence without a cut field", async () => {
  const handoff = buildSceneCompositionHandoff(await catalog(), {
    textStates: [{ id: "proof", role: "source-proof", targetId: "material", status: "active" }],
    frameSelections: [
      frameInput("detail", "CF-03", { detailTarget: "product-detail", sourceContext: "presenter-claim" }, ["proof"]),
      frameInput("material", "CF-04", { primaryMaterial: "source-card", secondarySubject: "presenter" }, ["proof"]),
    ],
    sequenceSelections: [{
      referenceId: "CS-02",
      stateBindings: {
        preserve: ["detail"],
        change: ["material"],
        release: ["proof"],
        restore: ["detail"],
      },
    }],
  });

  assert.deepEqual(handoff.frameSelections.map((selection) => selection.unresolved), [[], []]);
  assert.deepEqual(handoff.sequenceSelections[0].stateBindings.restore, ["detail"]);
  assert.equal("mandatoryCut" in handoff.sequenceSelections[0], false);
});

test("SF-03 keeps persistent context, question, and result as separate states", async () => {
  const handoff = buildSceneCompositionHandoff(await catalog(), {
    textStates: [
      { id: "program-label", role: "persistent-context", status: "active" },
      { id: "question-panel", role: "question", status: "released" },
      { id: "answer-result", role: "answer-result", targetId: "participant-a", status: "active" },
    ],
    frameSelections: [
      frameInput("quiz-baseline", "CF-01", { contextSubjects: "quiz-participants" }, ["program-label", "question-panel"]),
      frameInput("participant-a-reaction", "CF-02", { selectedSubject: "participant-a" }, ["answer-result"]),
      frameInput("result-text-priority", "CF-05", {}, ["answer-result"]),
    ],
    sequenceSelections: [{
      referenceId: "CS-03",
      stateBindings: {
        preserve: ["quiz-baseline", "program-label"],
        change: ["participant-a-reaction", "result-text-priority", "answer-result"],
        release: ["question-panel"],
        restore: [],
      },
    }],
  });

  assert.equal(handoff.textStates.find((state) => state.id === "program-label")?.status, "active");
  assert.equal(handoff.textStates.find((state) => state.id === "question-panel")?.status, "released");
  assert.equal(handoff.textStates.find((state) => state.id === "answer-result")?.status, "active");
  assert.deepEqual(handoff.frameSelections.find((selection) => selection.id === "result-text-priority")?.unresolved, ["context"]);
  assert.deepEqual(handoff.sequenceSelections[0].stateBindings.release, ["question-panel"]);
});

test("SF-04 makes HOLD an affirmative composition state", async () => {
  const handoff = buildSceneCompositionHandoff(await catalog(), {
    textStates: [
      { id: "caption", role: "speech-caption", targetId: "creator", status: "active" },
      { id: "reaction-caption", role: "reaction-caption", targetId: "creator", status: "released" },
    ],
    frameSelections: [
      frameInput("creator-frame", "CF-02", { selectedSubject: "creator" }, ["caption", "reaction-caption"]),
      frameInput("text-priority", "CF-05", { context: "creator" }, ["caption"]),
    ],
    sequenceSelections: [{
      referenceId: "CS-04",
      stateBindings: {
        preserve: ["creator-frame"],
        change: ["caption"],
        release: ["reaction-caption"],
        restore: [],
      },
    }],
  });

  const hold = handoff.sequenceSelections[0];
  assert.ok(hold.stateBindings.preserve.includes("creator-frame"));
  assert.deepEqual(hold.stateBindings.change, ["caption"]);
  assert.equal(hold.stateBindings.change.some((id) => handoff.frameSelections.some((selection) => selection.id === id)), false);
});

test("SF-05 derives product identity unresolved state without inventing an asset", async () => {
  const loaded = await catalog();
  const incomplete = buildSceneCompositionHandoff(loaded, {
    textStates: [{ id: "product-copy", role: "product-copy", status: "active" }],
    frameSelections: [
      frameInput("use-detail", "CF-03", { detailTarget: "use-action", sourceContext: "demonstration" }),
      frameInput("product-identity", "CF-06", {}, ["product-copy"]),
    ],
    sequenceSelections: [],
  });
  assert.deepEqual(incomplete.frameSelections.find((selection) => selection.id === "product-identity")?.unresolved, ["productIdentity"]);
  assert.equal("productAsset" in incomplete.frameSelections.find((selection) => selection.id === "product-identity")!, false);

  const complete = buildSceneCompositionHandoff(loaded, {
    ...clone({
      textStates: [{ id: "product-copy", role: "product-copy", status: "active" as const }],
      frameSelections: [
        frameInput("use-detail", "CF-03", { detailTarget: "use-action", sourceContext: "demonstration" }),
        frameInput("product-identity", "CF-06", { productIdentity: "package-01" }, ["product-copy"]),
      ],
      sequenceSelections: [],
    }),
  });
  assert.deepEqual(complete.frameSelections.find((selection) => selection.id === "product-identity")?.unresolved, []);
});

test("composition builder rejects invalid references, bindings, roles, and state links", async () => {
  const loaded = await catalog();
  const base: SceneCompositionInput = {
    textStates: [{ id: "caption", role: "speech-caption", status: "active" }],
    frameSelections: [frameInput("frame", "CF-02", { selectedSubject: "speaker" }, ["caption"])],
    sequenceSelections: [],
  };

  assert.throws(() => buildSceneCompositionHandoff(loaded, {
    ...clone(base),
    frameSelections: [frameInput("frame", "CF-99", { selectedSubject: "speaker" }, ["caption"])],
  }), /Unknown frame reference: CF-99/);
  assert.throws(() => buildSceneCompositionHandoff(loaded, {
    ...clone(base),
    frameSelections: [frameInput("frame", "CF-02", { unknownSlot: "speaker" }, ["caption"])],
  }), /Unknown target slot for CF-02: unknownSlot/);
  assert.throws(() => buildSceneCompositionHandoff(loaded, {
    ...clone(base),
    frameSelections: [frameInput("frame", "CF-02", { selectedSubject: 4 as unknown as string }, ["caption"])],
  }), /Invalid scene composition input/);
  assert.throws(() => buildSceneCompositionHandoff(loaded, {
    ...clone(base),
    textStates: [{ id: "caption", role: "unknown-role", status: "active" }],
  }), /Unknown text role: unknown-role/);
  assert.throws(() => buildSceneCompositionHandoff(loaded, {
    ...clone(base),
    frameSelections: [frameInput("frame", "CF-02", { selectedSubject: "speaker" }, ["missing-text"])],
  }), /Unknown text state in frame selection frame: missing-text/);
  assert.throws(() => buildSceneCompositionHandoff(loaded, {
    ...clone(base),
    frameSelections: [
      frameInput("frame", "CF-02", { selectedSubject: "speaker" }, ["caption"]),
      frameInput("frame", "CF-02", { selectedSubject: "guest" }, ["caption"]),
    ],
  }), /Duplicate frame selection ID: frame/);
  assert.throws(() => buildSceneCompositionHandoff(loaded, {
    ...clone(base),
    sequenceSelections: [{
      referenceId: "CS-99",
      stateBindings: { preserve: [], change: [], release: [], restore: [] },
    }],
  }), /Unknown sequence reference: CS-99/);
  assert.throws(() => buildSceneCompositionHandoff(loaded, {
    ...clone(base),
    sequenceSelections: [{
      referenceId: "CS-01",
      stateBindings: { preserve: ["missing-state"], change: [], release: [], restore: [] },
    }],
  }), /Unknown state binding for CS-01.preserve: missing-state/);
});

test("required and optional target slots resolve differently", async () => {
  const loaded = await catalog();
  const handoff = buildSceneCompositionHandoff(loaded, {
    textStates: [],
    frameSelections: [
      frameInput("reaction", "CF-02", { selectedSubject: "guest" }),
      frameInput("product", "CF-06", {}),
    ],
    sequenceSelections: [],
  });
  assert.deepEqual(handoff.frameSelections[0].unresolved, []);
  assert.deepEqual(handoff.frameSelections[1].unresolved, ["productIdentity"]);
});

test("CS-04 requires a preserved frame and forbids a changed frame", async () => {
  const loaded = await catalog();
  const input: SceneCompositionInput = {
    textStates: [{ id: "caption", role: "speech-caption", status: "active" }],
    frameSelections: [frameInput("frame", "CF-02", { selectedSubject: "creator" }, ["caption"])],
    sequenceSelections: [{
      referenceId: "CS-04",
      stateBindings: { preserve: [], change: ["caption"], release: [], restore: [] },
    }],
  };
  assert.throws(() => buildSceneCompositionHandoff(loaded, input), /CS-04 requires preserve/);
  assert.throws(() => buildSceneCompositionHandoff(loaded, {
    ...clone(input),
    sequenceSelections: [{
      referenceId: "CS-04",
      stateBindings: { preserve: ["frame"], change: ["frame"], release: [], restore: [] },
    }],
  }), /CS-04 change must not reference a Frame Selection: frame/);
});

test("composition builder preserves inputs and catalog when returned output changes", async () => {
  const loaded = await catalog();
  const input: SceneCompositionInput = {
    textStates: [{ id: "caption", role: "speech-caption", targetId: "speaker", status: "active" }],
    frameSelections: [frameInput("frame", "CF-02", { selectedSubject: "speaker" }, ["caption"])],
    sequenceSelections: [],
  };
  const catalogBefore = clone(loaded);
  const inputBefore = clone(input);
  const handoff = buildSceneCompositionHandoff(loaded, input);

  handoff.frameSelections[0].targetBindings.selectedSubject = "changed";
  handoff.textStates[0].status = "released";

  assert.deepEqual(loaded, catalogBefore);
  assert.deepEqual(input, inputBefore);
});
