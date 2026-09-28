import { useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Plane, Quaternion, Vector3 } from 'three'
import type { JointName, PoseData, Quat } from '../../types/character'
import { useCharacterStore } from '../../store/useCharacterStore'
import { LIMB_CONFIGS } from '../../ik/limbConfig'
import { solveTwoBoneIK } from '../../ik/twoBoneIK'
import { resolveMeasurements } from '../../skeleton/jointDefs'
import { getJointObject } from '../../skeleton/jointObjectRegistry'

interface Props {
  jointName: JointName
  radius: number
}

// IK 모드에서 손/발 핸들을 드래그하면 카메라를 향한 평면 위에서 목표 지점을 구하고
// 2본 IK를 풀어 팔/다리 전체가 목표를 향해 따라오게 한다.
export default function IKDragHandle({ jointName, radius }: Props) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const { camera } = useThree()
  const planeRef = useRef(new Plane())
  const dragStartPoseRef = useRef<PoseData | null>(null)

  const config = LIMB_CONFIGS[jointName]
  const handleRadius = Math.max(radius * 0.7, 0.055)

  if (!config) return null

  const solve = (targetWorldPos: Vector3) => {
    const { proportions, setJointRotations } = useCharacterStore.getState()
    const measurements = resolveMeasurements(proportions)

    const pivotObj = getJointObject(config.pivotJoint)
    const parentObj = getJointObject(config.parentJoint)
    if (!pivotObj || !parentObj) return

    const rootWorldPos = new Vector3()
    pivotObj.getWorldPosition(rootWorldPos)
    const parentWorldQuat = parentObj.getWorldQuaternion(new Quaternion())
    const poleWorldDir = config.poleLocalDir.clone().applyQuaternion(parentWorldQuat).normalize()

    const result = solveTwoBoneIK({
      rootWorldPos,
      targetWorldPos,
      poleWorldDir,
      len1: config.len1(measurements),
      len2: config.len2(measurements),
      parentWorldQuat,
      maxBendAngle: config.maxBendAngle,
    })

    const upperQ: Quat = [result.upperLocal.x, result.upperLocal.y, result.upperLocal.z, result.upperLocal.w]
    const lowerQ: Quat = [result.lowerLocal.x, result.lowerLocal.y, result.lowerLocal.z, result.lowerLocal.w]
    setJointRotations({ [config.upperJoint]: upperQ, [config.lowerJoint]: lowerQ })
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const store = useCharacterStore.getState()
    store.selectJoint(jointName)
    store.setIsInteracting(true)
    dragStartPoseRef.current = store.pose
    setDragging(true)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)

    const camDir = new Vector3()
    camera.getWorldDirection(camDir)
    const effectorObj = getJointObject(jointName)
    const effectorWorldPos = new Vector3()
    if (effectorObj) effectorObj.getWorldPosition(effectorWorldPos)
    else effectorWorldPos.copy(e.point)
    planeRef.current.setFromNormalAndCoplanarPoint(camDir, effectorWorldPos)
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return
    e.stopPropagation()
    const target = new Vector3()
    const hit = e.ray.intersectPlane(planeRef.current, target)
    if (hit) solve(target)
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setDragging(false)
    const store = useCharacterStore.getState()
    store.setIsInteracting(false)
    if (dragStartPoseRef.current) store.commitHistory(dragStartPoseRef.current)
    dragStartPoseRef.current = null
  }

  return (
    <mesh
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      renderOrder={10}
    >
      <sphereGeometry args={[handleRadius, 14, 14]} />
      <meshBasicMaterial color={dragging ? 0xff5a3d : hovered ? 0xffb27a : 0xff8a3d} depthTest={false} />
    </mesh>
  )
}
