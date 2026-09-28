import { useMemo } from 'react'
import { Quaternion, type Group } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { CHILDREN_MAP, JOINT_DEFS, computeJointGeometry, resolveMeasurements } from '../../skeleton/jointDefs'
import type { JointName } from '../../types/character'
import { useCharacterStore } from '../../store/useCharacterStore'
import JointHandle from './JointHandle'
import BodyMaterial from './BodyMaterial'
import FaceLayer from '../Face/FaceLayer'
import { registerJointObject } from '../../skeleton/jointObjectRegistry'

interface JointNodeProps {
  jointName: JointName
  onSelectJoint: (name: JointName, e: ThreeEvent<PointerEvent>) => void
}

function JointNode({ jointName, onSelectJoint }: JointNodeProps) {
  const proportions = useCharacterStore((s) => s.proportions)
  const rotation = useCharacterStore((s) => s.pose.rotations[jointName])
  const showHandles = useCharacterStore((s) => s.viewToggles.jointHandles)
  const showSkeletonLines = useCharacterStore((s) => s.viewToggles.skeletonLines)

  const def = JOINT_DEFS[jointName]
  const measurements = useMemo(() => resolveMeasurements(proportions), [proportions])
  const geom = useMemo(() => computeJointGeometry(jointName, measurements), [jointName, measurements])
  const children = CHILDREN_MAP[jointName]

  const quat = useMemo(() => new Quaternion(rotation[0], rotation[1], rotation[2], rotation[3]), [rotation])

  const capsuleLen = Math.max(0.001, geom.boneLength - geom.radius * 2)
  const meshCenterY = geom.boneAxis === 'up' ? geom.boneLength / 2 : -geom.boneLength / 2

  const setGroupRef = (obj: Group | null) => registerJointObject(jointName, obj)

  return (
    <group ref={setGroupRef} position={geom.offset} quaternion={quat}>
      {geom.meshType === 'capsule' && (
        <mesh position={[0, meshCenterY, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[geom.radius, capsuleLen, 4, 10]} />
          <BodyMaterial />
        </mesh>
      )}
      {geom.meshType === 'sphere' && (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[geom.radius, 20, 16]} />
          <BodyMaterial />
        </mesh>
      )}

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

      {showHandles && def.isHandle && (
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
