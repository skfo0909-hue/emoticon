// PNG 내보내기용 오프스크린 렌더러. 현재 렌더 모드/조명 설정을 그대로 반영하고
// 캐릭터의 실제 바운딩 박스를 구해 캔버스 중앙에 꽉 차게 배치한다.
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { BodyProportions, ExpressionState, PoseData } from '../types/character'
import { buildCharacterObject3D, disposeCharacterObject3D } from './buildCharacterObject3D'
import type { LightSettings, RenderMode } from '../store/useCharacterStore'

const D2R = Math.PI / 180

export interface ExportOptions {
  width: number
  height: number
  transparent: boolean
  renderMode: RenderMode
  light: LightSettings
  backgroundColor?: string
  expression?: ExpressionState
}

export function renderCharacterToDataURL(
  proportions: BodyProportions,
  pose: PoseData,
  options: ExportOptions,
): string {
  const { width, height, transparent, renderMode, light, backgroundColor = '#f5eedf', expression } = options

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(width, height, false)
  renderer.setPixelRatio(1)
  if (transparent) {
    renderer.setClearColor(0x000000, 0)
  } else {
    renderer.setClearColor(backgroundColor, 1)
  }

  const scene = new Scene()
  scene.add(new AmbientLight(0xfff3e2, 0.7))
  const dir = new DirectionalLight(0xfffaf0, 1.3)
  const az = light.azimuth * D2R
  const el = light.elevation * D2R
  const r = 4
  dir.position.set(r * Math.sin(az) * Math.cos(el), r * Math.sin(el) + 1.5, r * Math.cos(az) * Math.cos(el))
  scene.add(dir)

  const character = buildCharacterObject3D(proportions, pose, renderMode, undefined, expression)
  scene.add(character)

  const box = new Box3().setFromObject(character)
  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())

  const aspect = width / height
  const camera = new PerspectiveCamera(28, aspect, 0.05, 50)
  const fovRad = (camera.fov * D2R) / 2

  // 세로/가로 모두 여유 있게 들어오도록 두 기준 중 더 먼 거리를 사용한다.
  const marginFactor = 1.35
  const distanceForHeight = (size.y * 0.5 * marginFactor) / Math.tan(fovRad)
  const distanceForWidth = (size.x * 0.5 * marginFactor) / (Math.tan(fovRad) * aspect)
  const distance = Math.max(distanceForHeight, distanceForWidth, 0.5)

  camera.position.set(center.x, center.y, center.z + distance)
  camera.lookAt(center)
  camera.updateProjectionMatrix()

  renderer.render(scene, camera)
  const dataUrl = renderer.domElement.toDataURL('image/png')

  scene.remove(character)
  disposeCharacterObject3D(character)
  renderer.dispose()

  return dataUrl
}

export function downloadDataURL(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
