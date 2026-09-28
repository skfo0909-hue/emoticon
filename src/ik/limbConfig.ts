import { Vector3 } from 'three'
import type { JointName } from '../types/character'
import type { ResolvedMeasurements } from '../skeleton/jointDefs'

export interface LimbIKConfig {
  effectorJoint: JointName
  pivotJoint: JointName
  parentJoint: JointName
  upperJoint: JointName
  lowerJoint: JointName
  len1: (m: ResolvedMeasurements) => number
  len2: (m: ResolvedMeasurements) => number
  poleLocalDir: Vector3
  maxBendAngle: number
}

const D2R = Math.PI / 180
const FORWARD = new Vector3(0, 0, 1)
const BACKWARD = new Vector3(0, 0, -1)

export const LIMB_CONFIGS: Partial<Record<JointName, LimbIKConfig>> = {
  handL: {
    effectorJoint: 'handL',
    pivotJoint: 'shoulderL',
    parentJoint: 'torso',
    upperJoint: 'upperArmL',
    lowerJoint: 'elbowL',
    len1: (m) => m.upperArmLength,
    len2: (m) => m.lowerArmLength,
    poleLocalDir: FORWARD,
    maxBendAngle: 150 * D2R,
  },
  handR: {
    effectorJoint: 'handR',
    pivotJoint: 'shoulderR',
    parentJoint: 'torso',
    upperJoint: 'upperArmR',
    lowerJoint: 'elbowR',
    len1: (m) => m.upperArmLength,
    len2: (m) => m.lowerArmLength,
    poleLocalDir: FORWARD,
    maxBendAngle: 150 * D2R,
  },
  footL: {
    effectorJoint: 'footL',
    pivotJoint: 'hipL',
    parentJoint: 'pelvis',
    upperJoint: 'hipL',
    lowerJoint: 'kneeL',
    len1: (m) => m.thighLength,
    len2: (m) => m.shinLength,
    poleLocalDir: BACKWARD,
    maxBendAngle: 150 * D2R,
  },
  footR: {
    effectorJoint: 'footR',
    pivotJoint: 'hipR',
    parentJoint: 'pelvis',
    upperJoint: 'hipR',
    lowerJoint: 'kneeR',
    len1: (m) => m.thighLength,
    len2: (m) => m.shinLength,
    poleLocalDir: BACKWARD,
    maxBendAngle: 150 * D2R,
  },
}
