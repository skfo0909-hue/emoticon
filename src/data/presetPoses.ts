// 기본 포즈 라이브러리 10종. 각도(도) 단위로 읽기 쉽게 정의한 뒤 쿼터니언으로 변환해 저장한다.
import { Euler, Quaternion } from 'three'
import { ALL_JOINT_NAMES, createDefaultPose, type JointName, type PoseData, type Quat } from '../types/character'

const D2R = Math.PI / 180

type EulerDeg = [number, number, number]

function quatFromDeg([x, y, z]: EulerDeg): Quat {
  const q = new Quaternion().setFromEuler(new Euler(x * D2R, y * D2R, z * D2R, 'XYZ'))
  return [q.x, q.y, q.z, q.w]
}

export function buildPose(
  overrides: Partial<Record<JointName, EulerDeg>>,
  pelvis?: { rotation?: EulerDeg; position?: [number, number, number] },
): PoseData {
  const pose = createDefaultPose()
  for (const name of ALL_JOINT_NAMES) {
    const deg = overrides[name]
    if (deg) pose.rotations[name] = quatFromDeg(deg)
  }
  if (pelvis?.rotation) pose.pelvisTransform.rotation = quatFromDeg(pelvis.rotation)
  if (pelvis?.position) pose.pelvisTransform.position = pelvis.position
  return pose
}

export interface PresetPose {
  id: string
  name: string
  pose: PoseData
}

export const PRESET_POSES: PresetPose[] = [
  {
    id: 'idle',
    name: '기본 서기',
    pose: buildPose({}),
  },
  {
    id: 'walk',
    name: '걷기',
    pose: buildPose({
      torso: [5, 6, 0],
      hipL: [-28, 0, 0],
      kneeL: [42, 0, 0],
      footL: [10, 0, 0],
      hipR: [22, 0, 0],
      kneeR: [10, 0, 0],
      upperArmR: [-26, 0, 10],
      elbowR: [18, 0, 0],
      upperArmL: [20, 0, -10],
      elbowL: [10, 0, 0],
      head: [0, -8, 0],
    }),
  },
  {
    id: 'run',
    name: '달리기',
    pose: buildPose({
      torso: [20, 8, 0],
      neck: [-5, 0, 0],
      head: [-6, 0, 0],
      hipL: [-48, 0, 0],
      kneeL: [85, 0, 0],
      footL: [15, 0, 0],
      hipR: [38, 0, 0],
      kneeR: [25, 0, 0],
      upperArmR: [-45, 0, 18],
      elbowR: [70, 0, 0],
      upperArmL: [38, 0, -18],
      elbowL: [60, 0, 0],
    }),
  },
  {
    id: 'jump',
    name: '점프',
    pose: buildPose({
      torso: [-6, 0, 0],
      head: [-8, 0, 0],
      upperArmL: [-158, 0, -18],
      elbowL: [12, 0, 0],
      upperArmR: [-158, 0, 18],
      elbowR: [12, 0, 0],
      hipL: [-30, 0, 0],
      kneeL: [55, 0, 0],
      footL: [15, 0, 0],
      hipR: [-30, 0, 0],
      kneeR: [55, 0, 0],
      footR: [15, 0, 0],
    }),
  },
  {
    id: 'wave',
    name: '손 흔들기',
    pose: buildPose({
      head: [0, 12, 0],
      upperArmR: [-150, 0, 25],
      elbowR: [75, 0, 0],
      handR: [0, 0, 20],
      upperArmL: [8, 0, -6],
    }),
  },
  {
    id: 'cheer',
    name: '만세',
    pose: buildPose({
      torso: [-6, 0, 0],
      head: [-10, 0, 0],
      upperArmL: [-168, 0, -10],
      elbowL: [6, 0, 0],
      upperArmR: [-168, 0, 10],
      elbowR: [6, 0, 0],
    }),
  },
  {
    id: 'despair',
    name: '좌절 (무릎 꿇기)',
    pose: buildPose(
      {
        torso: [14, 0, 0],
        neck: [10, 0, 0],
        head: [14, 0, 0],
        upperArmL: [32, 0, -8],
        elbowL: [22, 0, 0],
        upperArmR: [32, 0, 8],
        elbowR: [22, 0, 0],
        hipL: [98, 0, 0],
        kneeL: [140, 0, 0],
        footL: [40, 0, 0],
        hipR: [98, 0, 0],
        kneeR: [140, 0, 0],
        footR: [40, 0, 0],
      },
      { position: [0, -0.36, 0] },
    ),
  },
  {
    id: 'heart',
    name: '하트 만들기',
    pose: buildPose({
      head: [-5, 0, 0],
      upperArmL: [-148, 0, -25],
      elbowL: [85, 0, 0],
      handL: [0, 0, -25],
      upperArmR: [-148, 0, 25],
      elbowR: [85, 0, 0],
      handR: [0, 0, 25],
    }),
  },
  {
    id: 'sit',
    name: '앉기',
    pose: buildPose(
      {
        hipL: [-92, 0, 0],
        kneeL: [92, 0, 0],
        footL: [-5, 0, 0],
        hipR: [-92, 0, 0],
        kneeR: [92, 0, 0],
        footR: [-5, 0, 0],
        upperArmL: [10, 0, -8],
        upperArmR: [10, 0, 8],
      },
      { position: [0, -0.34, 0] },
    ),
  },
  {
    id: 'lie',
    name: '누워서 뒹굴기',
    pose: buildPose(
      {
        neck: [10, 0, 0],
        head: [0, 15, 10],
        upperArmL: [-40, 0, -30],
        elbowL: [30, 0, 0],
        upperArmR: [60, 0, 20],
        elbowR: [15, 0, 0],
        hipL: [-15, 0, 0],
        kneeL: [35, 0, 0],
        hipR: [-40, 0, 10],
        kneeR: [70, 0, 0],
      },
      { rotation: [0, 0, 90], position: [0, -0.55, 0] },
    ),
  },
]
