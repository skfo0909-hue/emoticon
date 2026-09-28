import { useRef, useState } from 'react'
import { Euler, Quaternion } from 'three'
import { useCharacterStore } from '../../store/useCharacterStore'
import { JOINT_DEFS } from '../../skeleton/jointDefs'
import type { PoseData, Quat } from '../../types/character'

const R2D = 180 / Math.PI
const D2R = Math.PI / 180

// 머리 단독 회전: 끄덕임(X), 좌우 돌림(Y), 갸웃(Z)을 슬라이더로 직접 조절한다.
export default function HeadRotationPanel() {
  const headRotation = useCharacterStore((s) => s.pose.rotations.head)
  const setJointRotation = useCharacterStore((s) => s.setJointRotation)
  const commitHistory = useCharacterStore((s) => s.commitHistory)
  const [dragging, setDragging] = useState(false)
  const dragStartPoseRef = useRef<PoseData | null>(null)

  const limit = JOINT_DEFS.head.limit
  const euler = new Euler().setFromQuaternion(
    new Quaternion(headRotation[0], headRotation[1], headRotation[2], headRotation[3]),
    'XYZ',
  )

  const apply = (x: number, y: number, z: number) => {
    const q = new Quaternion().setFromEuler(new Euler(x, y, z, 'XYZ'))
    const quat: Quat = [q.x, q.y, q.z, q.w]
    setJointRotation('head', quat)
  }

  const startDrag = () => {
    if (dragging) return
    setDragging(true)
    dragStartPoseRef.current = useCharacterStore.getState().pose
  }
  const endDrag = () => {
    if (!dragging) return
    setDragging(false)
    if (dragStartPoseRef.current) commitHistory(dragStartPoseRef.current)
    dragStartPoseRef.current = null
  }

  const sliders: { key: 'x' | 'y' | 'z'; label: string }[] = [
    { key: 'x', label: '끄덕임' },
    { key: 'y', label: '좌우 돌림' },
    { key: 'z', label: '갸웃' },
  ]

  return (
    <div className="panel-card">
      <h2 className="panel-title">머리 회전</h2>
      <div className="flex flex-col gap-3">
        {sliders.map((s) => {
          const value = euler[s.key]
          const [min, max] = limit[s.key]
          return (
            <label key={s.key} className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between">
                <span>{s.label}</span>
                <span className="text-[var(--accent)] font-medium">{Math.round(value * R2D)}°</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={D2R}
                value={value}
                onPointerDown={startDrag}
                onPointerUp={endDrag}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  const next = { x: euler.x, y: euler.y, z: euler.z, [s.key]: v } as {
                    x: number
                    y: number
                    z: number
                  }
                  apply(next.x, next.y, next.z)
                }}
                className="hand-slider"
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
