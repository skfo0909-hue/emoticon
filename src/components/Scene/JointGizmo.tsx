import { useMemo, useRef } from 'react'
import { TransformControls } from '@react-three/drei'
import type { Quaternion as ThreeQuaternion } from 'three'
import { useCharacterStore } from '../../store/useCharacterStore'
import { getJointObject } from '../../skeleton/jointObjectRegistry'
import { JOINT_DEFS } from '../../skeleton/jointDefs'
import { clampQuaternionToLimit } from '../../skeleton/clampRotation'
import type { PoseData, Quat } from '../../types/character'

// 선택된 관절에 기즈모(TransformControls)를 붙인다.
// 골반은 이동/회전 모드를 전환할 수 있고, 그 외 관절은 FK 모드에서 회전만 가능하다.
// 관절별 가동 범위를 벗어나지 않도록 clamp 한다.
export default function JointGizmo() {
  const selectedJoint = useCharacterStore((s) => s.selectedJoint)
  const interactionMode = useCharacterStore((s) => s.interactionMode)
  const pelvisGizmoMode = useCharacterStore((s) => s.pelvisGizmoMode)
  const setJointRotation = useCharacterStore((s) => s.setJointRotation)
  const setPelvisTransform = useCharacterStore((s) => s.setPelvisTransform)
  const commitHistory = useCharacterStore((s) => s.commitHistory)
  const setIsInteracting = useCharacterStore((s) => s.setIsInteracting)

  const dragStartPoseRef = useRef<PoseData | null>(null)

  const object = selectedJoint ? getJointObject(selectedJoint) : undefined
  const def = selectedJoint ? JOINT_DEFS[selectedJoint] : null
  const isPelvis = selectedJoint === 'pelvis'

  const showAxes = useMemo(() => {
    if (!def || isPelvis) return { x: true, y: true, z: true }
    return {
      x: def.limit.x[0] !== def.limit.x[1],
      y: def.limit.y[0] !== def.limit.y[1],
      z: def.limit.z[0] !== def.limit.z[1],
    }
  }, [def, isPelvis])

  if (!selectedJoint || !object || !def) return null
  if (!isPelvis && interactionMode !== 'fk') return null

  const mode = isPelvis ? pelvisGizmoMode : 'rotate'

  return (
    <TransformControls
      object={object}
      mode={mode}
      space="local"
      size={0.7}
      showX={showAxes.x}
      showY={showAxes.y}
      showZ={showAxes.z}
      onMouseDown={() => {
        dragStartPoseRef.current = useCharacterStore.getState().pose
        setIsInteracting(true)
      }}
      onMouseUp={() => {
        setIsInteracting(false)
        const start = dragStartPoseRef.current
        if (start) commitHistory(start)
        dragStartPoseRef.current = null
      }}
      onObjectChange={() => {
        if (isPelvis) {
          const pos: [number, number, number] = [object.position.x, object.position.y, object.position.z]
          const rot: Quat = [object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w]
          setPelvisTransform(pos, rot)
          return
        }
        const clamped = clampQuaternionToLimit(object.quaternion as ThreeQuaternion, def.limit)
        object.quaternion.copy(clamped)
        const q: Quat = [clamped.x, clamped.y, clamped.z, clamped.w]
        setJointRotation(selectedJoint, q)
      }}
    />
  )
}
