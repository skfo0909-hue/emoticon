// 좌우 대칭 포즈 복사/반전을 위한 유틸리티.
// 캐릭터의 좌우 축은 로컬 X이므로, 로컬 회전 쿼터니언을 좌우 미러링하려면
// Y, Z 성분의 부호를 뒤집는다 (X, W는 그대로 유지).
import type { JointName, Quat } from '../types/character'

export function mirrorQuat(q: Quat): Quat {
  return [q[0], -q[1], -q[2], q[3]]
}

export const LR_JOINT_PAIRS: [JointName, JointName][] = [
  ['shoulderL', 'shoulderR'],
  ['upperArmL', 'upperArmR'],
  ['elbowL', 'elbowR'],
  ['lowerArmL', 'lowerArmR'],
  ['handL', 'handR'],
  ['hipL', 'hipR'],
  ['thighL', 'thighR'],
  ['kneeL', 'kneeR'],
  ['shinL', 'shinR'],
  ['footL', 'footR'],
]

export const CENTER_JOINTS: JointName[] = ['torso', 'neck', 'head']
