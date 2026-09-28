// 포즈 전환 보간. 현재 포즈에서 목표 포즈로 관절 쿼터니언을 슬러프(slerp)하며
// 부드럽게 전환한다. 골반 위치는 lerp, 회전은 slerp로 처리한다.
import { Quaternion, Vector3 } from 'three'
import { ALL_JOINT_NAMES } from '../types/character'
import type { PoseData, Quat } from '../types/character'
import { useCharacterStore } from '../store/useCharacterStore'

let activeAnimationId = 0

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function transitionToPose(targetPose: PoseData, durationMs = 450) {
  const store = useCharacterStore.getState()
  const startPose = store.pose
  const myId = ++activeAnimationId

  const startQuats = new Map<string, Quaternion>()
  const targetQuats = new Map<string, Quaternion>()
  for (const name of ALL_JOINT_NAMES) {
    const s = startPose.rotations[name]
    const t = targetPose.rotations[name]
    startQuats.set(name, new Quaternion(s[0], s[1], s[2], s[3]))
    targetQuats.set(name, new Quaternion(t[0], t[1], t[2], t[3]))
  }
  const startPelvisPos = new Vector3(...startPose.pelvisTransform.position)
  const targetPelvisPos = new Vector3(...targetPose.pelvisTransform.position)
  const startPelvisRot = new Quaternion(...startPose.pelvisTransform.rotation)
  const targetPelvisRot = new Quaternion(...targetPose.pelvisTransform.rotation)

  const startTime = performance.now()

  function step(now: number) {
    if (myId !== activeAnimationId) return // 새 전환이 시작되면 이전 애니메이션은 중단
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / durationMs)
    const eased = easeInOutCubic(t)

    const rotations: Partial<Record<string, Quat>> = {}
    for (const name of ALL_JOINT_NAMES) {
      const q = startQuats.get(name)!.clone().slerp(targetQuats.get(name)!, eased)
      rotations[name] = [q.x, q.y, q.z, q.w]
    }
    const pelvisPos = startPelvisPos.clone().lerp(targetPelvisPos, eased)
    const pelvisRot = startPelvisRot.clone().slerp(targetPelvisRot, eased)

    useCharacterStore.setState((state) => ({
      pose: {
        rotations: { ...state.pose.rotations, ...rotations } as PoseData['rotations'],
        pelvisTransform: {
          position: [pelvisPos.x, pelvisPos.y, pelvisPos.z],
          rotation: [pelvisRot.x, pelvisRot.y, pelvisRot.z, pelvisRot.w],
        },
      },
    }))

    if (t < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}
