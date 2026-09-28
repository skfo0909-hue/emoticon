// 해석적(analytic) 2본 IK 솔버.
// 상위 뼈(upper)와 하위 뼈(lower) 두 개로 목표 지점에 닿도록 회전을 계산한다.
// 뼈 메쉬가 모두 원통형(캡슐/구)이라 트위스트(roll)가 시각적으로 드러나지 않으므로,
// bendAxis를 두 본 모두의 로컬 X축으로 일관되게 사용해 하위 관절 회전이
// 자연스럽게 순수 힌지(X축 전용) 회전이 되도록 구성한다.
import { Matrix4, Quaternion, Vector3 } from 'three'

export interface TwoBoneIKInput {
  rootWorldPos: Vector3
  targetWorldPos: Vector3
  poleWorldDir: Vector3
  len1: number
  len2: number
  /** 상위 관절의 부모(예: 몸통/골반)의 현재 월드 회전 */
  parentWorldQuat: Quaternion
  /** 하위 관절(팔꿈치/무릎)의 최대 굽힘 각도 (라디안) */
  maxBendAngle: number
}

export interface TwoBoneIKResult {
  upperLocal: Quaternion
  lowerLocal: Quaternion
}

const EPS = 1e-4

function clampNum(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function basisQuaternion(xAxis: Vector3, yAxisHint: Vector3): Quaternion {
  const x = xAxis.clone().normalize()
  const z = new Vector3().crossVectors(x, yAxisHint).normalize()
  const y = new Vector3().crossVectors(z, x).normalize()
  const m = new Matrix4().makeBasis(x, y, z)
  return new Quaternion().setFromRotationMatrix(m)
}

export function solveTwoBoneIK(input: TwoBoneIKInput): TwoBoneIKResult {
  const { rootWorldPos, targetWorldPos, poleWorldDir, len1, len2, parentWorldQuat, maxBendAngle } = input

  let toTarget = new Vector3().subVectors(targetWorldPos, rootWorldPos)
  let d = toTarget.length()
  if (d < EPS) {
    toTarget = new Vector3(0, -1, 0)
    d = EPS
  }
  const dirToTarget = toTarget.clone().normalize()

  // 하위 관절이 설정된 최대 굽힘각 이상 접히지 않도록 최소 거리를 확보한다.
  const innerMin = Math.PI - maxBendAngle
  const dMinBend = Math.sqrt(Math.max(0, len1 * len1 + len2 * len2 - 2 * len1 * len2 * Math.cos(innerMin)))
  const dMinReach = Math.abs(len1 - len2) + EPS
  const dMin = Math.max(dMinReach, dMinBend)
  const dMax = len1 + len2 - EPS
  const dClamped = clampNum(d, dMin, dMax)

  let bendAxis = new Vector3().crossVectors(dirToTarget, poleWorldDir)
  if (bendAxis.lengthSq() < 1e-8) {
    const alt = Math.abs(dirToTarget.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
    bendAxis = new Vector3().crossVectors(dirToTarget, alt)
  }
  bendAxis.normalize()

  const cosTheta1 = clampNum((len1 * len1 + dClamped * dClamped - len2 * len2) / (2 * len1 * dClamped), -1, 1)
  const theta1 = Math.acos(cosTheta1)

  const elbowDir = dirToTarget.clone().applyAxisAngle(bendAxis, theta1).normalize()
  const elbowWorldPos = rootWorldPos.clone().add(elbowDir.clone().multiplyScalar(len1))

  const clampedTargetPos = rootWorldPos.clone().add(dirToTarget.clone().multiplyScalar(dClamped))
  const lowerDir = new Vector3().subVectors(clampedTargetPos, elbowWorldPos).normalize()

  const upperWorldQuat = basisQuaternion(bendAxis, elbowDir.clone().negate())
  const lowerWorldQuat = basisQuaternion(bendAxis, lowerDir.clone().negate())

  const upperLocal = parentWorldQuat.clone().invert().multiply(upperWorldQuat)
  const lowerLocal = upperWorldQuat.clone().invert().multiply(lowerWorldQuat)

  return { upperLocal, lowerLocal }
}
