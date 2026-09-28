import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3, PerspectiveCamera as ThreePerspectiveCamera } from 'three'
import { useCharacterStore, type CameraViewName } from '../../store/useCharacterStore'
import { computeCharacterBounds, resolveMeasurements } from '../../skeleton/jointDefs'

const VIEW_ANGLES: Record<CameraViewName, { azimuth: number; elevation: number }> = {
  front: { azimuth: 0, elevation: 0 },
  threeQuarterLeft: { azimuth: -45, elevation: 8 },
  threeQuarterRight: { azimuth: 45, elevation: 8 },
  side: { azimuth: 90, elevation: 0 },
  back: { azimuth: 180, elevation: 0 },
  top: { azimuth: 0, elevation: 85 },
  bottom: { azimuth: 0, elevation: -75 },
}

const D2R = Math.PI / 180

export default function CameraRig() {
  const cameraView = useCharacterStore((s) => s.cameraView)
  const fov = useCharacterStore((s) => s.fov)
  const proportions = useCharacterStore((s) => s.proportions)
  const isInteracting = useCharacterStore((s) => s.isInteracting)
  const { camera } = useThree()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)

  const measurements = useMemo(() => resolveMeasurements(proportions), [proportions])
  const { minY, maxY } = useMemo(() => computeCharacterBounds(measurements), [measurements])
  const totalHeight = maxY - minY
  const targetY = (minY + maxY) * 0.5

  // FOV가 커질수록(원근감 강함) 가까이, 작아질수록(원근감 약함) 멀리 두어 화면상 크기를 유지한다.
  const baseSize = totalHeight * 0.7
  const distance = baseSize / Math.tan((fov * D2R) / 2)

  const prevDistanceRef = useRef(distance)
  const animatingRef = useRef(false)
  const animateTargetRef = useRef(new Vector3())
  const isFirstFrame = useRef(true)

  // 시점 버튼 클릭 시: 현재 거리 기준으로 목표 위치를 계산하고 애니메이션 시작
  useEffect(() => {
    const { azimuth, elevation } = VIEW_ANGLES[cameraView]
    const az = azimuth * D2R
    const el = elevation * D2R
    const d = prevDistanceRef.current
    const x = d * Math.sin(az) * Math.cos(el)
    const z = d * Math.cos(az) * Math.cos(el)
    const y = targetY + d * Math.sin(el)
    animateTargetRef.current.set(x, y, z)
    animatingRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraView])

  useFrame(() => {
    if (camera instanceof ThreePerspectiveCamera && camera.fov !== fov) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    const controls = controlsRef.current
    const target = controls ? controls.target : new Vector3(0, targetY, 0)

    if (isFirstFrame.current) {
      camera.position.copy(animateTargetRef.current)
      target.set(0, targetY, 0)
      isFirstFrame.current = false
    }

    // 체형/FOV 변화로 거리 값이 바뀌면, 현재 카메라 방향을 유지한 채 거리만 비례 보정
    if (Math.abs(distance - prevDistanceRef.current) > 1e-5) {
      const offset = camera.position.clone().sub(target)
      const currentDist = offset.length()
      if (currentDist > 1e-4) {
        const ratio = distance / prevDistanceRef.current
        offset.multiplyScalar(ratio)
        camera.position.copy(target.clone().add(offset))
      }
      prevDistanceRef.current = distance
      if (animatingRef.current) {
        const { azimuth, elevation } = VIEW_ANGLES[cameraView]
        const az = azimuth * D2R
        const el = elevation * D2R
        animateTargetRef.current.set(
          distance * Math.sin(az) * Math.cos(el),
          targetY + distance * Math.sin(el),
          distance * Math.cos(az) * Math.cos(el),
        )
      }
    }

    target.y = targetY

    if (animatingRef.current && !isInteracting) {
      camera.position.lerp(animateTargetRef.current, 0.15)
      if (camera.position.distanceTo(animateTargetRef.current) < 0.01) {
        animatingRef.current = false
      }
    }

    if (controls) controls.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!isInteracting}
      enablePan={false}
      minDistance={distance * 0.4}
      maxDistance={distance * 2.5}
      onStart={() => {
        animatingRef.current = false
      }}
      makeDefault
    />
  )
}
