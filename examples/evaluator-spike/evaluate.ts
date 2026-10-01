import type { SceneCompositionHandoff } from "../../schema/composition.js";

export type EvaluationStatus = "pass" | "warn" | "fail" | "skipped";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExecutionRegion {
  id: string;
  role: string;
  bounds?: Rectangle;
  safeAreaRequired?: boolean;
}

export interface ExecutionCompositionState {
  stateId: string;
  frameRef: string;
  subjectBindings?: Record<string, string>;
  regionBindings?: Record<string, string>;
}

export interface NormalizedExecutionReport {
  canvas: {
    width: number;
    height: number;
  };
  platformSafeArea?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  regions?: ExecutionRegion[];
  compositionStates?: ExecutionCompositionState[];
  holdComparison?: {
    beforeStateId: string;
    afterStateId: string;
  };
}

export interface EvaluationCheck {
  id: "E03" | "E05" | "E07";
  status: EvaluationStatus;
  message: string;
  evidence?: Record<string, unknown>;
}

export interface EvaluationResult {
  checks: EvaluationCheck[];
  hasFailures: boolean;
}

function isUsableRectangle(value: Rectangle | undefined): value is Rectangle {
  return Boolean(
    value &&
      Number.isFinite(value.x) &&
      Number.isFinite(value.y) &&
      Number.isFinite(value.width) &&
      Number.isFinite(value.height) &&
      value.width > 0 &&
      value.height > 0,
  );
}

function intersection(left: Rectangle, right: Rectangle): Rectangle | undefined {
  const x = Math.max(left.x, right.x);
  const y = Math.max(left.y, right.y);
  const width = Math.min(left.x + left.width, right.x + right.width) - x;
  const height = Math.min(left.y + left.height, right.y + right.height) - y;

  return width > 0 && height > 0 ? { x, y, width, height } : undefined;
}

function checkCaptionOverlap(report: NormalizedExecutionReport): EvaluationCheck {
  const captions = report.regions?.filter(
    (region) => region.role === "caption" && isUsableRectangle(region.bounds),
  );
  const protectedTargets = report.regions?.filter(
    (region) => region.role === "protected-target" && isUsableRectangle(region.bounds),
  );

  if (!captions?.length || !protectedTargets?.length) {
    return {
      id: "E03",
      status: "skipped",
      message: "Caption or protected-target bounds are unavailable.",
    };
  }

  for (const caption of captions) {
    for (const protectedTarget of protectedTargets) {
      const overlap = intersection(caption.bounds, protectedTarget.bounds);
      if (overlap) {
        return {
          id: "E03",
          status: "fail",
          message: "Caption overlaps protected target.",
          evidence: {
            captionRegionId: caption.id,
            protectedRegionId: protectedTarget.id,
            intersection: {
              ...overlap,
              area: overlap.width * overlap.height,
            },
          },
        };
      }
    }
  }

  return {
    id: "E03",
    status: "pass",
    message: "Caption avoids all protected target regions.",
    evidence: {
      captionRegionIds: captions.map((region) => region.id),
      protectedRegionIds: protectedTargets.map((region) => region.id),
    },
  };
}

function checkSafeArea(report: NormalizedExecutionReport): EvaluationCheck {
  const requiredRegions = report.regions?.filter((region) => region.safeAreaRequired);
  const safeArea = report.platformSafeArea;

  if (
    !safeArea ||
    !Number.isFinite(safeArea.left) ||
    !Number.isFinite(safeArea.top) ||
    !Number.isFinite(safeArea.right) ||
    !Number.isFinite(safeArea.bottom) ||
    !requiredRegions?.length ||
    requiredRegions.some((region) => !isUsableRectangle(region.bounds))
  ) {
    return {
      id: "E05",
      status: "skipped",
      message: "Safe-area metadata or required region bounds are unavailable.",
    };
  }

  const bounds: Rectangle = {
    x: safeArea.left,
    y: safeArea.top,
    width: report.canvas.width - safeArea.left - safeArea.right,
    height: report.canvas.height - safeArea.top - safeArea.bottom,
  };

  if (!isUsableRectangle(bounds)) {
    return {
      id: "E05",
      status: "skipped",
      message: "Safe-area bounds cannot be derived from the execution metadata.",
    };
  }

  for (const region of requiredRegions) {
    const regionBounds = region.bounds;
    if (
      !regionBounds ||
      regionBounds.x < bounds.x ||
      regionBounds.y < bounds.y ||
      regionBounds.x + regionBounds.width > bounds.x + bounds.width ||
      regionBounds.y + regionBounds.height > bounds.y + bounds.height
    ) {
      return {
        id: "E05",
        status: "fail",
        message: "A required region falls outside the supplied platform safe area.",
        evidence: {
          regionId: region.id,
          regionBounds,
          safeAreaBounds: bounds,
        },
      };
    }
  }

  return {
    id: "E05",
    status: "pass",
    message: "All required regions remain within the supplied platform safe area.",
    evidence: {
      regionIds: requiredRegions.map((region) => region.id),
      safeAreaBounds: bounds,
    },
  };
}

function holdSignature(state: ExecutionCompositionState): string {
  const serializeBindings = (bindings: Record<string, string> | undefined): string =>
    Object.entries(bindings ?? {})
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join(",");

  return [
    `frameRef=${state.frameRef}`,
    `subjects=${serializeBindings(state.subjectBindings)}`,
    `regions=${serializeBindings(state.regionBindings)}`,
  ].join("|");
}

function checkHoldPreserved(
  selectedComposition: SceneCompositionHandoff,
  report: NormalizedExecutionReport,
): EvaluationCheck {
  if (!selectedComposition.sequenceSelections.some((selection) => selection.referenceId === "CS-04")) {
    return {
      id: "E07",
      status: "skipped",
      message: "CS-04 is not selected for this scene composition.",
    };
  }

  const comparison = report.holdComparison;
  if (!comparison || !report.compositionStates) {
    return {
      id: "E07",
      status: "skipped",
      message: "HOLD comparison state metadata is unavailable.",
    };
  }

  const before = report.compositionStates.find((state) => state.stateId === comparison.beforeStateId);
  const after = report.compositionStates.find((state) => state.stateId === comparison.afterStateId);

  if (!before || !after) {
    return {
      id: "E07",
      status: "skipped",
      message: "The requested HOLD comparison states are unavailable.",
    };
  }

  const beforeSignature = holdSignature(before);
  const afterSignature = holdSignature(after);
  if (beforeSignature !== afterSignature) {
    return {
      id: "E07",
      status: "fail",
      message: "CS-04 HOLD changed its composition signature.",
      evidence: {
        beforeStateId: before.stateId,
        afterStateId: after.stateId,
        beforeSignature,
        afterSignature,
      },
    };
  }

  return {
    id: "E07",
    status: "pass",
    message: "CS-04 HOLD preserved frame and authored subject/region relationships.",
    evidence: {
      beforeStateId: before.stateId,
      afterStateId: after.stateId,
      holdSignature: beforeSignature,
    },
  };
}

export function evaluateSceneComposition(
  selectedComposition: SceneCompositionHandoff,
  executionReport: NormalizedExecutionReport,
): EvaluationResult {
  const checks = [
    checkCaptionOverlap(executionReport),
    checkSafeArea(executionReport),
    checkHoldPreserved(selectedComposition, executionReport),
  ];

  return {
    checks,
    hasFailures: checks.some((check) => check.status === "fail"),
  };
}
