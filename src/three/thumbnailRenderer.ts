// 포즈 썸네일을 오프스크린으로 렌더링해 PNG data URL로 반환한다.
// 렌더러/씬은 재사용하는 싱글턴으로 유지해 매번 WebGL 컨텍스트를 새로 만들지 않는다.
import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import type { BodyProportions, PoseData } from '../types/character'
import { buildCharacterObject3D, disposeCharacterObject3D } from './buildCharacterObject3D'
import { computeCharacterBounds, resolveMeasurements } from '../skeleton/jointDefs'

let renderer: WebGLRenderer | null = null
let scene: Scene | null = null
let camera: PerspectiveCamera | null = null

function ensureSetup(size: number) {
  if (!renderer) {
    renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true })
    renderer.setClearColor(0x000000, 0)
    scene = new Scene()
    scene.add(new AmbientLight(0xfff3e2, 0.9))
    const dir = new DirectionalLight(0xfffaf0, 1.1)
    dir.position.set(2, 3, 3)
    scene.add(dir)
    camera = new PerspectiveCamera(32, 1, 0.1, 50)
  }
  renderer.setSize(size, size, false)
  return { renderer: renderer!, scene: scene!, camera: camera! }
}

export function renderPoseThumbnail(
  proportions: BodyProportions,
  pose: PoseData,
  size = 128,
): string {
  const { renderer, scene, camera } = ensureSetup(size)

  const character = buildCharacterObject3D(proportions, pose)
  scene.add(character)

  const measurements = resolveMeasurements(proportions)
  const { minY, maxY } = computeCharacterBounds(measurements)
  const totalHeight = maxY - minY
  const targetY = (minY + maxY) * 0.5
  const baseSize = totalHeight * 0.72
  const distance = baseSize / Math.tan((camera.fov * Math.PI) / 180 / 2)

  camera.position.set(0, targetY, distance)
  camera.lookAt(0, targetY, 0)
  camera.updateProjectionMatrix()

  renderer.render(scene, camera)
  const dataUrl = renderer.domElement.toDataURL('image/png')

  scene.remove(character)
  disposeCharacterObject3D(character)

  return dataUrl
}
