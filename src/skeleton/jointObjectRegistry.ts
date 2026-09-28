// 각 관절 Group(Object3D)에 대한 비반응형 참조 저장소.
// TransformControls가 선택된 관절의 실제 three.js 객체를 찾을 때 사용한다.
import type { Group } from 'three'
import type { JointName } from '../types/character'

const registry = new Map<JointName, Group>()

export function registerJointObject(name: JointName, obj: Group | null) {
  if (obj) registry.set(name, obj)
  else registry.delete(name)
}

export function getJointObject(name: JointName): Group | undefined {
  return registry.get(name)
}
