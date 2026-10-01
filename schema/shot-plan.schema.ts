import type { EditingPattern } from "./pattern.js";
import type { SceneCompositionHandoff } from "./composition.js";

export interface SourceRange {
  startMs: number;
  endMs: number;
}

export interface SemanticBeat {
  id: string;
  meaning: string;
  sourceRange?: SourceRange;
}

export interface SemanticScene {
  sceneId: string;
  beats: SemanticBeat[];
}

export type ShotDecision = "establish" | "switch" | "insert" | "return" | "hold";

export interface ShotPlanStep {
  id: string;
  beatId: string;
  decision: ShotDecision;
  rationale: string;
  patternIds?: string[];
  frameSelectionId?: string;
  sequenceSelectionId?: string;
  returnToStepId?: string;
}

export interface ShotPlan {
  planId: string;
  sceneId: string;
  steps: ShotPlanStep[];
}

export interface ShotPlanHandoffStep extends ShotPlanStep {
  resolvedFrameSelectionId: string;
}

export interface ShotPlanHandoff {
  planId: string;
  sceneId: string;
  steps: ShotPlanHandoffStep[];
}

export interface BuildShotPlanHandoffInput {
  patterns: EditingPattern[];
  composition: SceneCompositionHandoff;
  scene: SemanticScene;
  plan: ShotPlan;
}
