import { useCharacterStore } from '../../store/useCharacterStore'
import {
  createDepthOnlyMaterial,
  createOutlineMaterial,
  createSilhouetteMaterial,
  createToonMaterial,
  OUTLINE_SCALE,
} from '../../three/materials'

// 재질은 파츠 전체가 공유하는 싱글턴으로 생성해 메쉬 수만큼 중복 생성하지 않는다.
const toonMat = createToonMaterial()
const outlineMat = createOutlineMaterial()
const silhouetteMat = createSilhouetteMaterial()
const depthOnlyMat = createDepthOnlyMaterial()

interface Props {
  type: 'capsule' | 'sphere'
  args: [radius: number, ...rest: number[]]
  position?: [number, number, number]
}

// 몸통 파츠 메쉬. 렌더 모드에 따라 툰(본체+외곽선) / 외곽선만 / 실루엣으로 그린다.
// 외곽선은 뒷면만 그리는(backface) 약간 확대된 셸 메쉬로 구현한다.
export default function BodyPartMesh({ type, args, position = [0, 0, 0] }: Props) {
  const renderMode = useCharacterStore((s) => s.renderMode)

  const geometry =
    type === 'capsule' ? (
      <capsuleGeometry args={[args[0], args[1], args[2], args[3]]} />
    ) : (
      <sphereGeometry args={[args[0], args[1], args[2]]} />
    )

  if (renderMode === 'silhouette') {
    return (
      <mesh position={position} material={silhouetteMat}>
        {geometry}
      </mesh>
    )
  }

  return (
    <group position={position}>
      {renderMode === 'toon' ? (
        <mesh material={toonMat} castShadow receiveShadow renderOrder={0}>
          {geometry}
        </mesh>
      ) : (
        // 외곽선만 모드: 색은 그리지 않고 깊이만 기록해 뒷면 셸의 안쪽이 비치지 않게 한다.
        // 먼저(renderOrder 낮게) 그려서 깊이를 확정한 뒤, 셸이 그 깊이와 비교되게 한다.
        <mesh material={depthOnlyMat} renderOrder={0}>
          {geometry}
        </mesh>
      )}
      <mesh scale={OUTLINE_SCALE} material={outlineMat} renderOrder={1}>
        {geometry}
      </mesh>
    </group>
  )
}
