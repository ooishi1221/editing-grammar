import {
  buildSceneCompositionHandoff,
  loadCompositionCatalog,
} from "../src/composition.js";

const catalog = await loadCompositionCatalog();

const composition = buildSceneCompositionHandoff(catalog, {
  frameSelections: [
    {
      id: "baseline",
      referenceId: "CF-01",
      targetBindings: {
        contextSubjects: "host-and-guest",
      },
      textStateIds: [],
    },
    {
      id: "guest-reaction",
      referenceId: "CF-02",
      targetBindings: {
        selectedSubject: "guest",
        baselineContext: "host-and-guest",
      },
      textStateIds: [],
    },
  ],
  textStates: [],
  sequenceSelections: [
    {
      referenceId: "CS-01",
      stateBindings: {
        preserve: ["baseline"],
        change: ["guest-reaction"],
        release: [],
        restore: ["baseline"],
      },
    },
  ],
});

console.log(JSON.stringify(composition, null, 2));
