import type { CompositionCatalog, SceneCompositionHandoff } from "./composition.js";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SafeAreaInsets {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface EvaluationContext {
  safeAreas?: Record<string, SafeAreaInsets>;
}

export interface E03EvaluationExpectation {
  id: string;
  checkId: "E03";
  captionRegionId: string;
  avoidRegionIds: string[];
}

export interface E05EvaluationExpectation {
  id: string;
  checkId: "E05";
  regionIds: string[];
  safeAreaId: string;
}

export interface E07EvaluationExpectation {
  id: string;
  checkId: "E07";
  sequenceReferenceId: "CS-04";
  preserveStateIds: string[];
}

export type EvaluationExpectation =
  | E03EvaluationExpectation
  | E05EvaluationExpectation
  | E07EvaluationExpectation;

export interface SceneEvaluationExpectations {
  checks: EvaluationExpectation[];
}

export interface ExecutionRegion {
  id: string;
  bounds?: Rectangle;
  authoredIds?: string[];
}

export interface ExecutionCompositionState {
  id: string;
  frameReferenceId: string;
  subjectBindings: Record<string, string>;
  regionBindings: Record<string, string>;
}

export interface ExecutionStateLineage {
  sequenceReferenceId: string;
  preserveStateIds: string[];
  beforeStateId: string;
  afterStateId: string;
}

export interface SceneExecutionReport {
  canvas: {
    width: number;
    height: number;
  };
  regions: ExecutionRegion[];
  compositionStates: ExecutionCompositionState[];
  stateLineage: ExecutionStateLineage[];
}

export type EvaluationStatus = "pass" | "warn" | "fail" | "skipped";

export interface EvaluationCheckResult {
  id: "E03" | "E05" | "E07";
  expectationId: string;
  status: EvaluationStatus;
  message: string;
  evidence?: Record<string, unknown>;
}

export interface SceneEvaluationResult {
  checks: EvaluationCheckResult[];
  hasFailures: boolean;
}

export interface EvaluateSceneInput {
  compositionCatalog: CompositionCatalog;
  selectedComposition: SceneCompositionHandoff;
  expectations: SceneEvaluationExpectations;
  context: EvaluationContext;
  executionReport: SceneExecutionReport;
}
