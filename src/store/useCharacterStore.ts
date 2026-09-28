import { create } from 'zustand'
import {
  ALL_JOINT_NAMES,
  DEFAULT_PROPORTIONS,
  createDefaultPose,
  type BodyProportions,
  type ExpressionState,
  type HeadRatioPreset,
  type JointName,
  type PoseData,
  type Quat,
  type SavedPose,
} from '../types/character'
import { computeHeadRatioMultipliers } from '../skeleton/jointDefs'
import { defaultExpression } from '../expression/expressionPresets'

export type InteractionMode = 'fk' | 'ik'

export type CameraViewName =
  | 'front'
  | 'threeQuarterLeft'
  | 'threeQuarterRight'
  | 'side'
  | 'back'
  | 'top'
  | 'bottom'

export type RenderMode = 'toon' | 'outline' | 'silhouette'

export interface LightSettings {
  azimuth: number // 방위각 (도)
  elevation: number // 고도 (도)
  shadow: boolean
}

export interface ViewToggles {
  grid: boolean
  floorShadow: boolean
  jointHandles: boolean
  skeletonLines: boolean
}

export interface HistoryEntry {
  pose: PoseData
}

interface CharacterState {
  proportions: BodyProportions
  headRatioPreset: HeadRatioPreset | null
  pose: PoseData
  selectedJoint: JointName | null
  interactionMode: InteractionMode
  cameraView: CameraViewName
  fov: number
  viewToggles: ViewToggles
  renderMode: RenderMode
  light: LightSettings
  expression: ExpressionState
  savedPoses: SavedPose[]
  past: HistoryEntry[]
  future: HistoryEntry[]
  isInteracting: boolean

  setProportion: (key: keyof BodyProportions, value: number) => void
  applyHeadRatioPreset: (preset: HeadRatioPreset) => void
  setJointRotation: (name: JointName, quat: Quat) => void
  setJointRotations: (updates: Partial<Record<JointName, Quat>>) => void
  setPelvisTransform: (position: [number, number, number], rotation: Quat) => void
  selectJoint: (name: JointName | null) => void
  setInteractionMode: (mode: InteractionMode) => void
  setCameraView: (view: CameraViewName) => void
  setFov: (fov: number) => void
  toggleViewOption: (key: keyof ViewToggles) => void
  setRenderMode: (mode: RenderMode) => void
  setLight: (partial: Partial<LightSettings>) => void
  setExpression: (partial: Partial<ExpressionState>) => void
  setPose: (pose: PoseData) => void
  resetPose: () => void
  commitHistory: (previousPose: PoseData) => void
  undo: () => void
  redo: () => void
  addSavedPose: (pose: SavedPose) => void
  removeSavedPose: (id: string) => void
  setIsInteracting: (value: boolean) => void
}

function clonePose(pose: PoseData): PoseData {
  return {
    pelvisTransform: {
      position: [...pose.pelvisTransform.position],
      rotation: [...pose.pelvisTransform.rotation],
    },
    rotations: { ...pose.rotations },
  } as PoseData
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  proportions: { ...DEFAULT_PROPORTIONS },
  headRatioPreset: 2.5,
  pose: createDefaultPose(),
  selectedJoint: null,
  interactionMode: 'fk',
  cameraView: 'front',
  fov: 32,
  viewToggles: {
    grid: true,
    floorShadow: true,
    jointHandles: true,
    skeletonLines: false,
  },
  renderMode: 'toon',
  light: { azimuth: 45, elevation: 55, shadow: true },
  expression: defaultExpression(),
  savedPoses: [],
  past: [],
  future: [],
  isInteracting: false,

  setProportion: (key, value) =>
    set((state) => ({
      proportions: { ...state.proportions, [key]: value },
      headRatioPreset: null,
    })),

  applyHeadRatioPreset: (preset) => {
    const { torsoLength, legLength } = computeHeadRatioMultipliers(preset)
    set((state) => ({
      proportions: { ...state.proportions, torsoLength, legLength },
      headRatioPreset: preset,
    }))
  },

  setJointRotation: (name, quat) =>
    set((state) => ({
      pose: {
        ...state.pose,
        rotations: { ...state.pose.rotations, [name]: quat },
      },
    })),

  setJointRotations: (updates) =>
    set((state) => ({
      pose: {
        ...state.pose,
        rotations: { ...state.pose.rotations, ...updates },
      },
    })),

  setPelvisTransform: (position, rotation) =>
    set((state) => ({
      pose: { ...state.pose, pelvisTransform: { position, rotation } },
    })),

  selectJoint: (name) => set({ selectedJoint: name }),
  setInteractionMode: (mode) => set({ interactionMode: mode }),
  setCameraView: (view) => set({ cameraView: view }),
  setFov: (fov) => set({ fov }),
  toggleViewOption: (key) =>
    set((state) => ({ viewToggles: { ...state.viewToggles, [key]: !state.viewToggles[key] } })),
  setRenderMode: (mode) => set({ renderMode: mode }),
  setLight: (partial) => set((state) => ({ light: { ...state.light, ...partial } })),
  setExpression: (partial) => set((state) => ({ expression: { ...state.expression, ...partial } })),

  setPose: (pose) => set({ pose }),

  resetPose: () => {
    const prev = clonePose(get().pose)
    set((state) => ({
      pose: createDefaultPose(),
      past: [...state.past, { pose: prev }].slice(-50),
      future: [],
    }))
  },

  commitHistory: (previousPose) =>
    set((state) => ({
      past: [...state.past, { pose: clonePose(previousPose) }].slice(-50),
      future: [],
    })),

  undo: () => {
    const { past, future, pose } = get()
    if (past.length === 0) return
    const last = past[past.length - 1]
    set({
      pose: last.pose,
      past: past.slice(0, -1),
      future: [{ pose: clonePose(pose) }, ...future].slice(0, 50),
    })
  },

  redo: () => {
    const { past, future, pose } = get()
    if (future.length === 0) return
    const next = future[0]
    set({
      pose: next.pose,
      future: future.slice(1),
      past: [...past, { pose: clonePose(pose) }].slice(-50),
    })
  },

  addSavedPose: (savedPose) => set((state) => ({ savedPoses: [...state.savedPoses, savedPose] })),
  removeSavedPose: (id) => set((state) => ({ savedPoses: state.savedPoses.filter((p) => p.id !== id) })),
  setIsInteracting: (value) => set({ isInteracting: value }),
}))

export function allJointNames(): JointName[] {
  return ALL_JOINT_NAMES
}
