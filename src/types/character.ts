// 캐릭터 뼈대/체형/포즈 관련 공용 타입 정의

export type JointName =
  | 'pelvis'
  | 'torso'
  | 'neck'
  | 'head'
  | 'shoulderL'
  | 'upperArmL'
  | 'elbowL'
  | 'lowerArmL'
  | 'handL'
  | 'shoulderR'
  | 'upperArmR'
  | 'elbowR'
  | 'lowerArmR'
  | 'handR'
  | 'hipL'
  | 'thighL'
  | 'kneeL'
  | 'shinL'
  | 'footL'
  | 'hipR'
  | 'thighR'
  | 'kneeR'
  | 'shinR'
  | 'footR'

export const ALL_JOINT_NAMES: JointName[] = [
  'pelvis',
  'torso',
  'neck',
  'head',
  'shoulderL',
  'upperArmL',
  'elbowL',
  'lowerArmL',
  'handL',
  'shoulderR',
  'upperArmR',
  'elbowR',
  'lowerArmR',
  'handR',
  'hipL',
  'thighL',
  'kneeL',
  'shinL',
  'footL',
  'hipR',
  'thighR',
  'kneeR',
  'shinR',
  'footR',
]

export type Side = 'L' | 'R'

// 체형 슬라이더 값 (배율, 1.0 = 기본값)
export interface BodyProportions {
  headSize: number
  armLength: number
  legLength: number
  torsoLength: number
  chubbiness: number
  handFootSize: number
}

export const DEFAULT_PROPORTIONS: BodyProportions = {
  headSize: 1,
  armLength: 1,
  legLength: 1,
  torsoLength: 1,
  chubbiness: 1,
  handFootSize: 1,
}

export type HeadRatioPreset = 2 | 2.5 | 3 | 4

// 관절 회전값. 쿼터니언(x,y,z,w) 형태로 저장해 체형과 독립적으로 유지한다.
export type Quat = [number, number, number, number]

export interface PelvisTransform {
  position: [number, number, number]
  rotation: Quat
}

export type JointRotations = Record<JointName, Quat>

export interface PoseData {
  pelvisTransform: PelvisTransform
  rotations: JointRotations
}

export const IDENTITY_QUAT: Quat = [0, 0, 0, 1]

export function createDefaultPose(): PoseData {
  const rotations = {} as JointRotations
  for (const name of ALL_JOINT_NAMES) {
    rotations[name] = [0, 0, 0, 1]
  }
  return {
    pelvisTransform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
    },
    rotations,
  }
}

export interface SavedPose {
  id: string
  name: string
  thumbnail?: string
  pose: PoseData
  expression?: ExpressionState
  createdAt: number
}

// ---- 표정 시스템 타입 ----
export type EyeShape =
  | 'dot'
  | 'circle'
  | 'smile'
  | 'closed'
  | 'sad'
  | 'x'
  | 'star'
  | 'heart'
  | 'spiral'

export type MouthShape =
  | 'smallSmile'
  | 'bigSmile'
  | 'openD'
  | 'siot'
  | 'wave'
  | 'o'
  | 'pout'
  | 'teeth'

export interface EyeState {
  shape: EyeShape
  size: number
  stretchY: number
  spacing: number
  lookX: number
  lookY: number
}

export interface EyebrowState {
  visible: boolean
  angle: number // + : 화남(↘↙ 방향), - : 슬픔(↗↖ 방향)
  height: number
}

export interface MouthState {
  shape: MouthShape
  size: number
  openness: number
}

export interface BlushState {
  size: number
  intensity: number
}

export type SymbolKind =
  | 'sweat'
  | 'angerMark'
  | 'heart'
  | 'heartMulti'
  | 'sparkle'
  | 'question'
  | 'exclaim'
  | 'shake'
  | 'gloom'
  | 'tear'
  | 'snot'
  | 'note'
  | 'zzz'

export type SymbolPosition = 'left' | 'right' | 'top' | 'topLeft' | 'topRight'

export interface FaceSymbol {
  id: string
  kind: SymbolKind
  position: SymbolPosition
  scale: number
}

export interface ExpressionState {
  eyes: EyeState
  eyebrow: EyebrowState
  mouth: MouthState
  blush: BlushState
  symbols: FaceSymbol[]
}
