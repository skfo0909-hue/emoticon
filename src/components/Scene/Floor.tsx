import { useCharacterStore } from '../../store/useCharacterStore'

export default function Floor() {
  const grid = useCharacterStore((s) => s.viewToggles.grid)
  const floorShadow = useCharacterStore((s) => s.viewToggles.floorShadow)

  return (
    <group>
      {floorShadow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.28} />
        </mesh>
      )}
      {grid && (
        <gridHelper args={[10, 20, '#1f4d3a', '#c9b795']} position={[0, 0, 0]} />
      )}
    </group>
  )
}
