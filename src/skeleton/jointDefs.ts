// 뼈대 계층 구조와 체형 배율로부터 각 관절의 위치/치수를 계산하는 모듈.
// 각 관절 그룹은 부모 관절 기준 로컬 -Y(아래) 또는 좌우 방향으로 오프셋되고,
// 그 자식이 다시 그 끝에 붙는 방식으로 체인을 구성한다.

import type { BodyProportions, HeadRatioPreset, JointName } from '../types/character'

export interface JointGeometry {
  /** 부모 관절로부터의 로컬 오프셋 (부모 로컬 좌표계 기준) */
  offset: [number, number, number]
  /** 이 관절에서 뻗어나가는 뼈(캡슐)의 길이. 0이면 뼈 메쉬를 그리지 않는다 */
  boneLength: number
  /** 뼈(캡슐) 반지름 */
  radius: number
  /** 뼈가 뻗는 방향 (로컬 축) */
  boneAxis: 'down' | 'up'
  meshType: 'capsule' | 'sphere' | 'none'
}

export interface RotationLimit {
  x: [number, number]
  y: [number, number]
  z: [number, number]
}

export interface JointDef {
  name: JointName
  parent: JointName | null
  limit: RotationLimit
  isHandle: boolean
  handleColor: number
}

const D2R = Math.PI / 180
const FREE: [number, number] = [-180 * D2R, 180 * D2R]

function lim(x: [number, number], y: [number, number], z: [number, number]): RotationLimit {
  return { x, y, z }
}

// 관절별 가동 범위 (라디안). 좌우 대칭이므로 z축(좌우 벌림)은 대칭 범위로 두어
// L/R 구분 없이 동일 정의를 재사용한다.
export const JOINT_DEFS: Record<JointName, JointDef> = {
  pelvis: { name: 'pelvis', parent: null, limit: lim(FREE, FREE, FREE), isHandle: true, handleColor: 0x2e7d32 },
  torso: { name: 'torso', parent: 'pelvis', limit: lim([-35 * D2R, 45 * D2R], [-50 * D2R, 50 * D2R], [-30 * D2R, 30 * D2R]), isHandle: true, handleColor: 0x2e7d32 },
  neck: { name: 'neck', parent: 'torso', limit: lim([-30 * D2R, 30 * D2R], [-60 * D2R, 60 * D2R], [-25 * D2R, 25 * D2R]), isHandle: true, handleColor: 0x2e7d32 },
  head: { name: 'head', parent: 'neck', limit: lim([-45 * D2R, 40 * D2R], [-85 * D2R, 85 * D2R], [-35 * D2R, 35 * D2R]), isHandle: true, handleColor: 0x2e7d32 },

  shoulderL: { name: 'shoulderL', parent: 'torso', limit: lim([-20 * D2R, 20 * D2R], [-20 * D2R, 20 * D2R], [-25 * D2R, 25 * D2R]), isHandle: true, handleColor: 0x2e7d32 },
  upperArmL: { name: 'upperArmL', parent: 'shoulderL', limit: lim([-170 * D2R, 90 * D2R], [-90 * D2R, 90 * D2R], [-100 * D2R, 100 * D2R]), isHandle: true, handleColor: 0x2e7d32 },
  elbowL: { name: 'elbowL', parent: 'upperArmL', limit: lim([0, 150 * D2R], [0, 0], [0, 0]), isHandle: true, handleColor: 0x2e7d32 },
  lowerArmL: { name: 'lowerArmL', parent: 'elbowL', limit: lim([0, 0], [-80 * D2R, 80 * D2R], [0, 0]), isHandle: false, handleColor: 0x2e7d32 },
  handL: { name: 'handL', parent: 'lowerArmL', limit: lim([-60 * D2R, 60 * D2R], [-30 * D2R, 30 * D2R], [-40 * D2R, 40 * D2R]), isHandle: true, handleColor: 0xff8a3d },

  shoulderR: { name: 'shoulderR', parent: 'torso', limit: lim([-20 * D2R, 20 * D2R], [-20 * D2R, 20 * D2R], [-25 * D2R, 25 * D2R]), isHandle: true, handleColor: 0x2e7d32 },
  upperArmR: { name: 'upperArmR', parent: 'shoulderR', limit: lim([-170 * D2R, 90 * D2R], [-90 * D2R, 90 * D2R], [-100 * D2R, 100 * D2R]), isHandle: true, handleColor: 0x2e7d32 },
  elbowR: { name: 'elbowR', parent: 'upperArmR', limit: lim([0, 150 * D2R], [0, 0], [0, 0]), isHandle: true, handleColor: 0x2e7d32 },
  lowerArmR: { name: 'lowerArmR', parent: 'elbowR', limit: lim([0, 0], [-80 * D2R, 80 * D2R], [0, 0]), isHandle: false, handleColor: 0x2e7d32 },
  handR: { name: 'handR', parent: 'lowerArmR', limit: lim([-60 * D2R, 60 * D2R], [-30 * D2R, 30 * D2R], [-40 * D2R, 40 * D2R]), isHandle: true, handleColor: 0xff8a3d },

  hipL: { name: 'hipL', parent: 'pelvis', limit: lim([-100 * D2R, 120 * D2R], [-45 * D2R, 45 * D2R], [-70 * D2R, 70 * D2R]), isHandle: true, handleColor: 0x2e7d32 },
  thighL: { name: 'thighL', parent: 'hipL', limit: lim([0, 0], [-45 * D2R, 45 * D2R], [0, 0]), isHandle: false, handleColor: 0x2e7d32 },
  kneeL: { name: 'kneeL', parent: 'thighL', limit: lim([-150 * D2R, 0], [0, 0], [0, 0]), isHandle: true, handleColor: 0x2e7d32 },
  shinL: { name: 'shinL', parent: 'kneeL', limit: lim([0, 0], [-30 * D2R, 30 * D2R], [0, 0]), isHandle: false, handleColor: 0x2e7d32 },
  footL: { name: 'footL', parent: 'shinL', limit: lim([-40 * D2R, 40 * D2R], [-30 * D2R, 30 * D2R], [-30 * D2R, 30 * D2R]), isHandle: true, handleColor: 0xff8a3d },

  hipR: { name: 'hipR', parent: 'pelvis', limit: lim([-100 * D2R, 120 * D2R], [-45 * D2R, 45 * D2R], [-70 * D2R, 70 * D2R]), isHandle: true, handleColor: 0x2e7d32 },
  thighR: { name: 'thighR', parent: 'hipR', limit: lim([0, 0], [-45 * D2R, 45 * D2R], [0, 0]), isHandle: false, handleColor: 0x2e7d32 },
  kneeR: { name: 'kneeR', parent: 'thighR', limit: lim([-150 * D2R, 0], [0, 0], [0, 0]), isHandle: true, handleColor: 0x2e7d32 },
  shinR: { name: 'shinR', parent: 'kneeR', limit: lim([0, 0], [-30 * D2R, 30 * D2R], [0, 0]), isHandle: false, handleColor: 0x2e7d32 },
  footR: { name: 'footR', parent: 'shinR', limit: lim([-40 * D2R, 40 * D2R], [-30 * D2R, 30 * D2R], [-30 * D2R, 30 * D2R]), isHandle: true, handleColor: 0xff8a3d },
}

// 부모 -> 자식 목록 캐시
export const CHILDREN_MAP: Record<JointName, JointName[]> = (() => {
  const map = {} as Record<JointName, JointName[]>
  for (const name of Object.keys(JOINT_DEFS) as JointName[]) {
    map[name] = []
  }
  for (const def of Object.values(JOINT_DEFS)) {
    if (def.parent) map[def.parent].push(def.name)
  }
  return map
})()

// ---- 체형 기준 치수 (배율 1.0 기준, 미터 단위) ----
// 관절 반지름은 인접한 뼈(캡슐) 반지름보다 항상 작게 유지해 팔다리가
// 몸통 속에 파묻히지 않고 옆으로 자연스럽게 붙도록 한다.
const BASE = {
  headRadius: 0.42,
  neckLength: 0.08,
  neckRadius: 0.09,
  pelvisHeight: 0.08,
  pelvisRadius: 0.16,
  torsoLength: 0.5,
  torsoRadius: 0.2,
  shoulderWidth: 0.5,
  hipWidth: 0.38,
  upperArmLength: 0.28,
  lowerArmLength: 0.24,
  handLength: 0.14,
  limbRadius: 0.075,
  handRadius: 0.09,
  thighLength: 0.34,
  shinLength: 0.3,
  footLength: 0.18,
  footRadius: 0.09,
  jointRadius: 0.08,
}

export function computeHeadRatioMultipliers(n: HeadRatioPreset): { torsoLength: number; legLength: number } {
  const headHeight = BASE.headRadius * 2
  const fixed = headHeight + BASE.neckLength + BASE.pelvisHeight
  const variable = BASE.torsoLength + BASE.thighLength + BASE.shinLength
  const k = (n * headHeight - fixed) / variable
  const clamped = Math.max(0.35, k)
  return { torsoLength: clamped, legLength: clamped }
}

export interface ResolvedMeasurements {
  headRadius: number
  neckLength: number
  neckRadius: number
  pelvisHeight: number
  pelvisRadius: number
  torsoLength: number
  torsoRadius: number
  shoulderWidth: number
  hipWidth: number
  upperArmLength: number
  lowerArmLength: number
  handLength: number
  limbRadius: number
  handRadius: number
  thighLength: number
  shinLength: number
  footLength: number
  footRadius: number
  jointRadius: number
}

export function resolveMeasurements(p: BodyProportions): ResolvedMeasurements {
  const chub = p.chubbiness
  return {
    headRadius: BASE.headRadius * p.headSize,
    neckLength: BASE.neckLength * p.torsoLength,
    neckRadius: BASE.neckRadius * (0.7 + 0.3 * chub),
    pelvisHeight: BASE.pelvisHeight * p.torsoLength,
    pelvisRadius: BASE.pelvisRadius * (0.7 + 0.3 * chub),
    torsoLength: BASE.torsoLength * p.torsoLength,
    torsoRadius: BASE.torsoRadius * chub,
    shoulderWidth: BASE.shoulderWidth * (0.75 + 0.25 * chub),
    hipWidth: BASE.hipWidth * (0.75 + 0.25 * chub),
    upperArmLength: BASE.upperArmLength * p.armLength,
    lowerArmLength: BASE.lowerArmLength * p.armLength,
    handLength: BASE.handLength * p.handFootSize,
    limbRadius: BASE.limbRadius * chub,
    handRadius: BASE.handRadius * p.handFootSize,
    thighLength: BASE.thighLength * p.legLength,
    shinLength: BASE.shinLength * p.legLength,
    footLength: BASE.footLength * p.handFootSize,
    footRadius: BASE.footRadius * p.handFootSize,
    jointRadius: BASE.jointRadius * (0.7 + 0.3 * chub),
  }
}

// 캐릭터의 대략적인 수직 범위(발바닥~정수리)를 계산한다. 골반(원점)을 기준으로
// 위로는 머리, 아래로는 발까지의 범위를 구해 카메라 프레이밍/센터링에 사용한다.
export function computeCharacterBounds(m: ResolvedMeasurements): { minY: number; maxY: number } {
  const maxY = m.pelvisHeight + m.torsoLength + m.neckLength + m.headRadius
  const minY = -(m.thighLength + m.shinLength + m.footLength + m.footRadius)
  return { minY, maxY }
}

// 각 관절의 로컬 오프셋과 뼈 치수를 계산한다.
export function computeJointGeometry(name: JointName, m: ResolvedMeasurements): JointGeometry {
  const sign = name.endsWith('L') ? -1 : 1
  switch (name) {
    case 'pelvis':
      return { offset: [0, 0, 0], boneLength: m.pelvisHeight, radius: m.pelvisRadius, boneAxis: 'up', meshType: 'capsule' }
    case 'torso':
      return { offset: [0, m.pelvisHeight, 0], boneLength: m.torsoLength, radius: m.torsoRadius, boneAxis: 'up', meshType: 'capsule' }
    case 'neck':
      return { offset: [0, m.torsoLength, 0], boneLength: m.neckLength, radius: m.neckRadius, boneAxis: 'up', meshType: 'capsule' }
    case 'head':
      return { offset: [0, m.neckLength, 0], boneLength: m.headRadius, radius: m.headRadius, boneAxis: 'up', meshType: 'sphere' }
    case 'shoulderL':
    case 'shoulderR':
      return { offset: [sign * m.shoulderWidth * 0.5, m.torsoLength * 0.92, 0], boneLength: m.jointRadius, radius: m.jointRadius, boneAxis: 'down', meshType: 'sphere' }
    case 'upperArmL':
    case 'upperArmR':
      return { offset: [0, 0, 0], boneLength: m.upperArmLength, radius: m.limbRadius, boneAxis: 'down', meshType: 'capsule' }
    case 'elbowL':
    case 'elbowR':
      return { offset: [0, -m.upperArmLength, 0], boneLength: m.limbRadius * 0.9, radius: m.limbRadius * 0.9, boneAxis: 'down', meshType: 'sphere' }
    case 'lowerArmL':
    case 'lowerArmR':
      return { offset: [0, 0, 0], boneLength: m.lowerArmLength, radius: m.limbRadius * 0.85, boneAxis: 'down', meshType: 'capsule' }
    case 'handL':
    case 'handR':
      return { offset: [0, -m.lowerArmLength, 0], boneLength: m.handLength, radius: m.handRadius, boneAxis: 'down', meshType: 'capsule' }
    case 'hipL':
    case 'hipR':
      return { offset: [sign * m.hipWidth * 0.5, 0, 0], boneLength: m.jointRadius, radius: m.jointRadius, boneAxis: 'down', meshType: 'sphere' }
    case 'thighL':
    case 'thighR':
      return { offset: [0, 0, 0], boneLength: m.thighLength, radius: m.limbRadius * 1.05, boneAxis: 'down', meshType: 'capsule' }
    case 'kneeL':
    case 'kneeR':
      return { offset: [0, -m.thighLength, 0], boneLength: m.limbRadius, radius: m.limbRadius, boneAxis: 'down', meshType: 'sphere' }
    case 'shinL':
    case 'shinR':
      return { offset: [0, 0, 0], boneLength: m.shinLength, radius: m.limbRadius * 0.85, boneAxis: 'down', meshType: 'capsule' }
    case 'footL':
    case 'footR':
      return { offset: [0, -m.shinLength, 0], boneLength: m.footLength, radius: m.footRadius, boneAxis: 'down', meshType: 'capsule' }
    default:
      return { offset: [0, 0, 0], boneLength: 0, radius: 0.05, boneAxis: 'down', meshType: 'none' }
  }
}
