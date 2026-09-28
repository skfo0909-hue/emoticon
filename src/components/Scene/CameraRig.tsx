import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Box3, Vector3, PerspectiveCamera as ThreePerspectiveCamera } from 'three'
import { useCharacterStore, type CameraViewName } from '../../store/useCharacterStore'
import { computeCharacterBounds, resolveMeasurements } from '../../skeleton/jointDefs'
import { getJointObject } from '../../skeleton/jointObjectRegistry'
import type { JointName } from '../../types/character'

const EXTENT_JOINTS: JointName[] = ['head', 'pelvis', 'handL', 'handR', 'footL', 'footR']
const tmpBox = new Box3()

// 현재 포즈의 실제 월드 위치(머리/손/발 등)를 기준으로 카메라가 바라볼 중심점과
// 캐릭터를 담기 위한 최소 반경을 구한다. 서 있는 자세뿐 아니라 앉기/눕기처럼
// 골반이나 팔다리가 크게 움직인 포즈에서도 캐릭터가 화면에 잘 들어오게 한다.
function computeLiveCenterAndRadius(): { center: Vector3; radius: number } | null {
  const points: Vector3[] = []
  for (const name of EXTENT_JOINTS) {
    const obj = getJointObject(name)
    if (!obj) continue
    const p = new Vector3()
    obj.getWorldPosition(p)
    points.push(p)
  }
  if (points.length === 0) return null
  tmpBox.setFromPoints(points)
  const center = tmpBox.getCenter(new Vector3())
  // 바운딩 박스의 대각선 절반을 반경으로 사용해, 점들이 한쪽으로 몰려 있어도
  // (예: 상체를 크게 숙인 포즈) 실제 차지하는 범위를 과소평가하지 않게 한다.
  const size = tmpBox.getSize(new Vector3())
  const radius = size.length() * 0.5
  return { center, radius }
}

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
  const standingTargetY = (minY + maxY) * 0.5

  // OrbitControls 줌 제한용 대략적인 기준 거리 (실시간 포즈 반경까지는 반영하지 않아도 충분함)
  const approxDistance = (totalHeight * 0.7) / Math.tan((fov * D2R) / 2)

  const prevDistanceRef = useRef(approxDistance)
  const animatingRef = useRef(false)
  const animateTargetRef = useRef(new Vector3())
  const isFirstFrame = useRef(true)
  const prevCenterRef = useRef(new Vector3(0, standingTargetY, 0))

  // 시점 버튼 클릭 시: 현재 거리/중심 기준으로 목표 위치를 계산하고 애니메이션 시작
  useEffect(() => {
    const { azimuth, elevation } = VIEW_ANGLES[cameraView]
    const az = azimuth * D2R
    const el = elevation * D2R
    const d = prevDistanceRef.current || approxDistance
    const c = prevCenterRef.current
    animateTargetRef.current.set(
      c.x + d * Math.sin(az) * Math.cos(el),
      c.y + d * Math.sin(el),
      c.z + d * Math.cos(az) * Math.cos(el),
    )
    animatingRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraView])

  useFrame(() => {
    if (camera instanceof ThreePerspectiveCamera && camera.fov !== fov) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    const controls = controlsRef.current
    const target = controls ? controls.target : new Vector3(0, standingTargetY, 0)

    // 현재 포즈의 실제 위치(머리/손/발)로 중심점과 필요 반경을 구한다.
    // 서 있는 자세 기준 반경과 비교해 더 큰 쪽을 사용해 앉기/눕기 등에서도 잘리지 않게 한다.
    const live = computeLiveCenterAndRadius()
    const center = live?.center ?? new Vector3(0, standingTargetY, 0)
    const liveRadius = live?.radius ?? totalHeight * 0.5
    const baseSize = Math.max(totalHeight * 0.7, liveRadius * 1.4)
    const distance = baseSize / Math.tan((fov * D2R) / 2)

    if (isFirstFrame.current) {
      camera.position.copy(animateTargetRef.current)
      target.copy(center)
      prevCenterRef.current.copy(center)
      prevDistanceRef.current = distance
      isFirstFrame.current = false
    }

    // 체형/FOV/포즈 변화로 거리 값이 바뀌면, 현재 카메라 방향을 유지한 채 거리만 비례 보정
    if (Math.abs(distance - prevDistanceRef.current) > 1e-5) {
      const offset = camera.position.clone().sub(target)
      const currentDist = offset.length()
      if (currentDist > 1e-4) {
        const ratio = distance / prevDistanceRef.current
        offset.multiplyScalar(ratio)
        camera.position.copy(target.clone().add(offset))
      }
      prevDistanceRef.current = distance
    }

    // 포즈가 바뀌어 캐릭터 중심이 이동하면(앉기/눕기 등) 카메라도 같은 만큼
    // 평행이동해 시야각/거리를 유지한 채 따라간다.
    const centerDelta = center.clone().sub(prevCenterRef.current)
    if (centerDelta.lengthSq() > 1e-10) {
      camera.position.add(centerDelta)
      animateTargetRef.current.add(centerDelta)
    }
    target.copy(center)
    prevCenterRef.current.copy(center)

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
      minDistance={approxDistance * 0.3}
      maxDistance={approxDistance * 3}
      onStart={() => {
        animatingRef.current = false
      }}
      makeDefault
    />
  )
}
