// React/R3F 없이 순수 three.js로 캐릭터 메쉬 계층을 생성한다.
// 포즈 썸네일 렌더링, PNG 내보내기 등 오프스크린 렌더링에 사용한다.
import { CapsuleGeometry, Group, Mesh, SphereGeometry, type Material } from 'three'
import { CHILDREN_MAP, computeJointGeometry, type ResolvedMeasurements } from '../skeleton/jointDefs'
import type { BodyProportions, JointName, PoseData } from '../types/character'
import { resolveMeasurements } from '../skeleton/jointDefs'
import {
  createDepthOnlyMaterial,
  createOutlineMaterial,
  createSilhouetteMaterial,
  createToonMaterial,
  OUTLINE_SCALE,
} from './materials'
import type { RenderMode } from '../store/useCharacterStore'

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

function buildJointGroup(
  jointName: JointName,
  measurements: ResolvedMeasurements,
  pose: PoseData,
  mats: PartMaterials,
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

  for (const child of CHILDREN_MAP[jointName]) {
    group.add(buildJointGroup(child, measurements, pose, mats))
  }

  return group
}

export function buildCharacterObject3D(
  proportions: BodyProportions,
  pose: PoseData,
  renderMode: RenderMode = 'toon',
  color?: string,
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
  return buildJointGroup('pelvis', measurements, pose, mats)
}

export function disposeCharacterObject3D(root: Group) {
  root.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.geometry.dispose()
      const mat = obj.material
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat.dispose()
    }
  })
}
