// React/R3F 없이 순수 three.js로 캐릭터 메쉬 계층을 생성한다.
// 포즈 썸네일 렌더링, PNG 내보내기 등 오프스크린 렌더링에 사용한다.
import {
  CanvasTexture,
  CapsuleGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
  type Material,
} from 'three'
import { CHILDREN_MAP, computeJointGeometry, type ResolvedMeasurements } from '../skeleton/jointDefs'
import type { BodyProportions, ExpressionState, JointName, PoseData } from '../types/character'
import { resolveMeasurements } from '../skeleton/jointDefs'
import {
  createDepthOnlyMaterial,
  createOutlineMaterial,
  createSilhouetteMaterial,
  createToonMaterial,
  OUTLINE_SCALE,
} from './materials'
import type { RenderMode } from '../store/useCharacterStore'
import { FACE_CANVAS_SIZE, drawFaceToCanvas } from '../expression/drawFace'
import { SYMBOL_CANVAS_SIZE, drawSymbolToCanvas } from '../expression/drawSymbol'
import type { SymbolPosition } from '../types/character'

interface PartMaterials {
  mode: RenderMode
  main?: Material
  outline?: Material
  silhouette?: Material
  depthOnly?: Material
}

function addPartMesh(group: Group, geometry: CapsuleGeometry | SphereGeometry, mats: PartMaterials) {
  if (mats.mode === 'silhouette') {
    group.add(new Mesh(geometry, mats.silhouette!))
    return
  }
  // 안쪽을 가리는 메쉬(본체 또는 깊이 전용)를 먼저(renderOrder 0) 그려 깊이를 확정한 뒤,
  // 뒷면 외곽선 셸(renderOrder 1)이 그 깊이와 비교되도록 한다.
  const innerMesh = new Mesh(geometry, mats.mode === 'toon' ? mats.main! : mats.depthOnly!)
  innerMesh.renderOrder = 0
  group.add(innerMesh)

  const outlineMesh = new Mesh(geometry, mats.outline!)
  outlineMesh.scale.setScalar(OUTLINE_SCALE)
  outlineMesh.renderOrder = 1
  group.add(outlineMesh)
}

function addFacePlane(headGroup: Group, headRadius: number, expression: ExpressionState, mode: RenderMode) {
  if (mode === 'silhouette') return
  const canvas = document.createElement('canvas')
  canvas.width = FACE_CANVAS_SIZE
  canvas.height = FACE_CANVAS_SIZE
  drawFaceToCanvas(canvas, expression, { lineOnly: mode === 'outline' })
  const texture = new CanvasTexture(canvas)
  const planeSize = headRadius * 1.5
  const mesh = new Mesh(
    new PlaneGeometry(planeSize, planeSize),
    new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
  )
  mesh.position.set(0, headRadius * 0.05, headRadius * 0.97)
  mesh.renderOrder = 2
  headGroup.add(mesh)
}

function buildJointGroup(
  jointName: JointName,
  measurements: ResolvedMeasurements,
  pose: PoseData,
  mats: PartMaterials,
  expression: ExpressionState | null,
): Group {
  const geom = computeJointGeometry(jointName, measurements)
  const group = new Group()
  group.name = jointName

  const rotation = jointName === 'pelvis' ? pose.pelvisTransform.rotation : pose.rotations[jointName]
  group.quaternion.set(rotation[0], rotation[1], rotation[2], rotation[3])

  if (jointName === 'pelvis') {
    group.position.set(...pose.pelvisTransform.position)
  } else {
    group.position.set(...geom.offset)
  }

  if (geom.meshType === 'capsule') {
    const capsuleLen = Math.max(0.001, geom.boneLength - geom.radius * 2)
    const partGroup = new Group()
    partGroup.position.y = geom.boneAxis === 'up' ? geom.boneLength / 2 : -geom.boneLength / 2
    addPartMesh(partGroup, new CapsuleGeometry(geom.radius, capsuleLen, 4, 10), mats)
    group.add(partGroup)
  } else if (geom.meshType === 'sphere') {
    addPartMesh(group, new SphereGeometry(geom.radius, 20, 16), mats)
  }

  if (jointName === 'head' && expression) {
    addFacePlane(group, geom.radius, expression, mats.mode)
  }

  for (const child of CHILDREN_MAP[jointName]) {
    group.add(buildJointGroup(child, measurements, pose, mats, expression))
  }

  return group
}

function symbolOffset(position: SymbolPosition, headRadius: number): Vector3 {
  switch (position) {
    case 'top':
      return new Vector3(0, headRadius * 1.35, headRadius * 0.2)
    case 'topLeft':
      return new Vector3(-headRadius * 0.95, headRadius * 1.05, headRadius * 0.2)
    case 'topRight':
      return new Vector3(headRadius * 0.95, headRadius * 1.05, headRadius * 0.2)
    case 'left':
      return new Vector3(-headRadius * 1.2, headRadius * 0.05, headRadius * 0.1)
    case 'right':
      return new Vector3(headRadius * 1.2, headRadius * 0.05, headRadius * 0.1)
  }
}

// 만화 기호는 머리 위치를 기준으로 붙지만 항상 카메라(항상 +Z에서 원점을 바라봄)를
// 향해야 하므로, 머리의 월드 변환을 구해 위치만 반영하고 회전은 카메라 정면으로 고정한다.
function addSymbols(root: Group, headRadius: number, expression: ExpressionState, mode: RenderMode) {
  if (expression.symbols.length === 0) return
  root.updateMatrixWorld(true)
  const head = root.getObjectByName('head')
  if (!head) return
  const headWorldPos = new Vector3()
  const headWorldQuat = new Quaternion()
  head.getWorldPosition(headWorldPos)
  head.getWorldQuaternion(headWorldQuat)

  for (const sym of expression.symbols) {
    const canvas = document.createElement('canvas')
    canvas.width = SYMBOL_CANVAS_SIZE
    canvas.height = SYMBOL_CANVAS_SIZE
    drawSymbolToCanvas(canvas, sym.kind, { lineOnly: mode === 'outline' })
    const texture = new CanvasTexture(canvas)
    const size = headRadius * 0.7 * sym.scale
    const mesh = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
    )
    const localOffset = symbolOffset(sym.position, headRadius)
    const worldOffset = localOffset.clone().applyQuaternion(headWorldQuat)
    mesh.position.copy(headWorldPos.clone().add(worldOffset))
    mesh.renderOrder = 3
    root.add(mesh)
  }
}

export function buildCharacterObject3D(
  proportions: BodyProportions,
  pose: PoseData,
  renderMode: RenderMode = 'toon',
  color?: string,
  expression?: ExpressionState,
): Group {
  const measurements = resolveMeasurements(proportions)
  const mats: PartMaterials = { mode: renderMode }
  if (renderMode === 'silhouette') {
    mats.silhouette = createSilhouetteMaterial()
  } else {
    mats.outline = createOutlineMaterial()
    if (renderMode === 'toon') mats.main = createToonMaterial(color)
    else mats.depthOnly = createDepthOnlyMaterial()
  }
  const root = buildJointGroup('pelvis', measurements, pose, mats, expression ?? null)
  if (expression && renderMode !== 'silhouette') {
    addSymbols(root, resolveMeasurements(proportions).headRadius, expression, renderMode)
  }
  return root
}

export function disposeCharacterObject3D(root: Group) {
  root.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.geometry.dispose()
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const mat of mats) {
        if (mat instanceof MeshBasicMaterial && mat.map) mat.map.dispose()
        mat.dispose()
      }
    }
  })
}
