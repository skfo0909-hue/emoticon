import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import CameraRig from './CameraRig'
import SceneLighting from './SceneLighting'
import Floor from './Floor'
import CharacterRig from './CharacterRig'
import JointGizmo from './JointGizmo'
import { useCharacterStore } from '../../store/useCharacterStore'

export default function CanvasStage() {
  const selectJoint = useCharacterStore((s) => s.selectJoint)

  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ fov: 32, position: [0, 0.8, 3] }}
      onPointerMissed={() => selectJoint(null)}
      // 터치 드래그(회전/핀치줌/관절 조작) 중 브라우저의 기본 스크롤·확대를 막는다.
      style={{ touchAction: 'none' }}
    >
      <color attach="background" args={['#f5eedf']} />
      <Suspense fallback={null}>
        <SceneLighting />
        <Floor />
        <CharacterRig />
        <JointGizmo />
        <CameraRig />
      </Suspense>
    </Canvas>
  )
}
