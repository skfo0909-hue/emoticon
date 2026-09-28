// 쿼터니언을 관절 가동 범위(오일러 XYZ 기준)로 clamp 하는 유틸리티.
import { Euler, Quaternion } from 'three'
import type { RotationLimit } from './jointDefs'
import type { Quat } from '../types/character'

function clampValue(v: number, [min, max]: [number, number]) {
  if (min === max) return min
  return Math.min(max, Math.max(min, v))
}

export function clampQuaternionToLimit(q: Quaternion, limit: RotationLimit): Quaternion {
  const euler = new Euler().setFromQuaternion(q, 'XYZ')
  euler.x = clampValue(euler.x, limit.x)
  euler.y = clampValue(euler.y, limit.y)
  euler.z = clampValue(euler.z, limit.z)
  return new Quaternion().setFromEuler(euler)
}

export function clampQuatArray(quat: Quat, limit: RotationLimit): Quat {
  const q = new Quaternion(quat[0], quat[1], quat[2], quat[3])
  const clamped = clampQuaternionToLimit(q, limit)
  return [clamped.x, clamped.y, clamped.z, clamped.w]
}
