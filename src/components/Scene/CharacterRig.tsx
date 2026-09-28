import { useMemo } from 'react'
import { Quaternion, type Group } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { CHILDREN_MAP, JOINT_DEFS, computeJointGeometry, resolveMeasurements } from '../../skeleton/jointDefs'
import type { JointName } from '../../types/character'
import { useCharacterStore } from '../../store/useCharacterStore'
import JointHandle from './JointHandle'
import IKDragHandle from './IKDragHandle'
import BodyPartMesh from './BodyPartMesh'
import FaceLayer from '../Face/FaceLayer'
import { registerJointObject } from '../../skeleton/jointObjectRegistry'
import { LIMB_CONFIGS } from '../../ik/limbConfig'

interface JointNodeProps {
  jointName: JointName
  onSelectJoint: (name: JointName, e: ThreeEvent<PointerEvent>) => void
}

function JointNode({ jointName, onSelectJoint }: JointNodeProps) {
  const proportions = useCharacterStore((s) => s.proportions)
  const rotation = useCharacterStore((s) => s.pose.rotations[jointName])
  const pelvisTransform = useCharacterStore((s) => s.pose.pelvisTransform)
  const showHandles = useCharacterStore((s) => s.viewToggles.jointHandles)
  const showSkeletonLines = useCharacterStore((s) => s.viewToggles.skeletonLines)
  const interactionMode = useCharacterStore((s) => s.interactionMode)

  const def = JOINT_DEFS[jointName]
  const isPelvis = jointName === 'pelvis'
  const measurements = useMemo(() => resolveMeasurements(proportions), [proportions])
  const geom = useMemo(() => computeJointGeometry(jointName, measurements), [jointName, measurements])
  const children = CHILDREN_MAP[jointName]

  const activeRotation = isPelvis ? pelvisTransform.rotation : rotation
  const position: [number, number, number] = isPelvis ? pelvisTransform.position : geom.offset

  const quat = useMemo(
    () => new Quaternion(activeRotation[0], activeRotation[1], activeRotation[2], activeRotation[3]),
    [activeRotation],
  )

  const capsuleLen = Math.max(0.001, geom.boneLength - geom.radius * 2)
  const meshCenterY = geom.boneAxis === 'up' ? geom.boneLength / 2 : -geom.boneLength / 2

  const setGroupRef = (obj: Group | null) => registerJointObject(jointName, obj)
  const isIKEffector = interactionMode === 'ik' && !!LIMB_CONFIGS[jointName]

  return (
    <group ref={setGroupRef} position={position} quaternion={quat}>
      {geom.meshType === 'capsule' && (
        <BodyPartMesh type="capsule" args={[geom.radius, capsuleLen, 4, 10]} position={[0, meshCenterY, 0]} />
      )}
      {geom.meshType === 'sphere' && <BodyPartMesh type="sphere" args={[geom.radius, 20, 16]} />}

      {jointName === 'head' && <FaceLayer headRadius={geom.radius} />}

      {showSkeletonLines && geom.boneLength > 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([0, 0, 0, 0, geom.boneAxis === 'up' ? geom.boneLength : -geom.boneLength, 0]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={0x1f4d3a} />
        </line>
      )}

      {showHandles && def.isHandle && isIKEffector && <IKDragHandle jointName={jointName} radius={geom.radius} />}
      {showHandles && def.isHandle && !isIKEffector && (
        <JointHandle jointName={jointName} radius={geom.radius} color={def.handleColor} onSelect={onSelectJoint} />
      )}

      {children.map((child) => (
        <JointNode key={child} jointName={child} onSelectJoint={onSelectJoint} />
      ))}
    </group>
  )
}

export default function CharacterRig() {
  const selectJoint = useCharacterStore((s) => s.selectJoint)

  const handleSelect = (name: JointName, e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    selectJoint(name)
  }

  return <JointNode jointName="pelvis" onSelectJoint={handleSelect} />
}
