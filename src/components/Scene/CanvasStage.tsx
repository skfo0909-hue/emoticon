import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import CameraRig from './CameraRig'
import SceneLighting from './SceneLighting'
import Floor from './Floor'
import CharacterRig from './CharacterRig'
import { useCharacterStore } from '../../store/useCharacterStore'

export default function CanvasStage() {
  const selectJoint = useCharacterStore((s) => s.selectJoint)

  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ fov: 32, position: [0, 0.8, 3] }}
      onPointerMissed={() => selectJoint(null)}
    >
      <color attach="background" args={['#f5eedf']} />
      <Suspense fallback={null}>
        <SceneLighting />
        <Floor />
        <CharacterRig />
        <CameraRig />
      </Suspense>
    </Canvas>
  )
}
