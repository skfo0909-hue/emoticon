import { useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { JointName } from '../../types/character'
import { useCharacterStore } from '../../store/useCharacterStore'

interface Props {
  jointName: JointName
  radius: number
  color: number
  onSelect: (name: JointName, e: ThreeEvent<PointerEvent>) => void
}

// 관절 위치에 표시되는 작은 원형(구) 핸들. 클릭하면 해당 관절이 선택된다.
export default function JointHandle({ jointName, radius, color, onSelect }: Props) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const selectedJoint = useCharacterStore((s) => s.selectedJoint)
  const isSelected = selectedJoint === jointName

  const handleRadius = Math.min(Math.max(radius * 0.4, 0.032), 0.06)

  return (
    <mesh
      ref={meshRef}
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelect(jointName, e)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      renderOrder={10}
    >
      <sphereGeometry args={[handleRadius, 12, 12]} />
      <meshBasicMaterial
        color={isSelected ? 0xff8a3d : hovered ? 0xffe08a : color}
        depthTest={false}
        transparent
        opacity={isSelected ? 1 : 0.9}
      />
    </mesh>
  )
}
