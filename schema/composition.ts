export type TextRoleId = string;
export type CompositionSemanticId = string;
export type AuthoredCompositionId = string;

export interface InferredCompositionEvidence {
  type: "inferred";
  sourceIds: string[];
  observationIds: string[];
  researchRelationIds?: string[];
}

export interface ProposalCompositionEvidence {
  type: "proposal";
  rationale: string;
}

export type CompositionEvidence = InferredCompositionEvidence | ProposalCompositionEvidence;

export interface CompositionTargetSlot {
  description: string;
  required: boolean;
}

export interface CompositionFrameReference {
  id: string;
  label: CompositionSemanticId;
  primaryAttention: CompositionSemanticId;
  subjectRelation: CompositionSemanticId;
  framingRelation: CompositionSemanticId;
  regionRelation: CompositionSemanticId;
  targetSlots: Record<string, CompositionTargetSlot>;
  invariants: string[];
  evidence: CompositionEvidence[];
}

export interface CompositionSequenceEffects {
  preserve: CompositionSemanticId[];
  change: CompositionSemanticId[];
  release: CompositionSemanticId[];
  restore: CompositionSemanticId[];
}

export interface CompositionSequenceReference {
  id: string;
  label: CompositionSemanticId;
  effects: CompositionSequenceEffects;
  invariants: string[];
  evidence: CompositionEvidence[];
}

export interface CompositionTextRole {
  id: TextRoleId;
  label: string;
  description: string;
}

export interface CompositionTextState {
  id: AuthoredCompositionId;
  role: TextRoleId;
  targetId?: AuthoredCompositionId;
  status: "active" | "released";
}

export interface CompositionFrameSelectionInput {
  id: AuthoredCompositionId;
  referenceId: string;
  targetBindings: Record<string, AuthoredCompositionId>;
  textStateIds: AuthoredCompositionId[];
}

export interface CompositionFrameSelection extends CompositionFrameSelectionInput {
  unresolved: string[];
}

export interface CompositionSequenceSelectionInput {
  referenceId: string;
  stateBindings: {
    preserve: AuthoredCompositionId[];
    change: AuthoredCompositionId[];
    release: AuthoredCompositionId[];
    restore: AuthoredCompositionId[];
  };
}

export type CompositionSequenceSelection = CompositionSequenceSelectionInput;

export interface SceneCompositionInput {
  frameSelections: CompositionFrameSelectionInput[];
  textStates: CompositionTextState[];
  sequenceSelections: CompositionSequenceSelectionInput[];
}

export interface SceneCompositionHandoff {
  frameSelections: CompositionFrameSelection[];
  textStates: CompositionTextState[];
  sequenceSelections: CompositionSequenceSelection[];
}

export interface CompositionCatalog {
  frameReferences: CompositionFrameReference[];
  sequenceReferences: CompositionSequenceReference[];
  textRoles: CompositionTextRole[];
}
