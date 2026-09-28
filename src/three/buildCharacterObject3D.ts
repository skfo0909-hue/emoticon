// React/R3F 없이 순수 three.js로 캐릭터 메쉬 계층을 생성한다.
// 포즈 썸네일 렌더링, PNG 내보내기 등 오프스크린 렌더링에 사용한다.
import { CapsuleGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three'
import {
  CHILDREN_MAP,
  computeJointGeometry,
  type ResolvedMeasurements,
} from '../skeleton/jointDefs'
import type { BodyProportions, JointName, PoseData } from '../types/character'
import { resolveMeasurements } from '../skeleton/jointDefs'

const BODY_COLOR = 0xf3d9b1

function buildJointGroup(
  jointName: JointName,
  measurements: ResolvedMeasurements,
  pose: PoseData,
  material: MeshStandardMaterial,
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
    const mesh = new Mesh(new CapsuleGeometry(geom.radius, capsuleLen, 4, 10), material)
    mesh.position.y = geom.boneAxis === 'up' ? geom.boneLength / 2 : -geom.boneLength / 2
    group.add(mesh)
  } else if (geom.meshType === 'sphere') {
    const mesh = new Mesh(new SphereGeometry(geom.radius, 20, 16), material)
    group.add(mesh)
  }

  for (const child of CHILDREN_MAP[jointName]) {
    group.add(buildJointGroup(child, measurements, pose, material))
  }

  return group
}

export function buildCharacterObject3D(proportions: BodyProportions, pose: PoseData, color = BODY_COLOR): Group {
  const measurements = resolveMeasurements(proportions)
  const material = new MeshStandardMaterial({ color })
  return buildJointGroup('pelvis', measurements, pose, material)
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
