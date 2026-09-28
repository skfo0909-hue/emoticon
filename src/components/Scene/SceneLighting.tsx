import { useMemo, useRef } from 'react'
import { useCharacterStore } from '../../store/useCharacterStore'
import type { DirectionalLight } from 'three'

const D2R = Math.PI / 180

// 조명 방향(방위각/고도)을 구면좌표로 변환해 방향광을 배치한다.
export default function SceneLighting() {
  const light = useCharacterStore((s) => s.light)
  const lightRef = useRef<DirectionalLight>(null)

  const position = useMemo(() => {
    const az = light.azimuth * D2R
    const el = light.elevation * D2R
    const r = 4
    return [r * Math.sin(az) * Math.cos(el), r * Math.sin(el) + 1.2, r * Math.cos(az) * Math.cos(el)] as [
      number,
      number,
      number,
    ]
  }, [light.azimuth, light.elevation])

  return (
    <>
      <ambientLight intensity={0.65} color="#fff3e2" />
      <directionalLight
        ref={lightRef}
        position={position}
        intensity={1.4}
        color="#fffaf0"
        castShadow={light.shadow}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-camera-near={0.1}
        shadow-camera-far={10}
        shadow-bias={-0.001}
      />
    </>
  )
}
