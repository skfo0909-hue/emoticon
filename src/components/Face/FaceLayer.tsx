import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture } from 'three'
import { useCharacterStore } from '../../store/useCharacterStore'
import { FACE_CANVAS_SIZE, drawFaceToCanvas } from '../../expression/drawFace'
import SymbolLayer from './SymbolLayer'

interface Props {
  headRadius: number
}

// 얼굴(눈/눈썹/입/볼터치)을 CanvasTexture로 그려 머리 앞면에 붙인다.
// 머리 그룹의 자식이므로 머리 회전에 함께 따라간다.
export default function FaceLayer({ headRadius }: Props) {
  const expression = useCharacterStore((s) => s.expression)
  const renderMode = useCharacterStore((s) => s.renderMode)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<CanvasTexture | null>(null)

  if (!canvasRef.current) {
    const c = document.createElement('canvas')
    c.width = FACE_CANVAS_SIZE
    c.height = FACE_CANVAS_SIZE
    canvasRef.current = c
  }

  const texture = useMemo(() => {
    const tex = new CanvasTexture(canvasRef.current!)
    textureRef.current = tex
    return tex
  }, [])

  useEffect(() => {
    if (renderMode === 'silhouette') return
    drawFaceToCanvas(canvasRef.current!, expression, { lineOnly: renderMode === 'outline' })
    textureRef.current!.needsUpdate = true
  }, [expression, renderMode])

  useEffect(() => () => texture.dispose(), [texture])

  if (renderMode === 'silhouette') return null

  const planeSize = headRadius * 1.5

  return (
    <group>
      <mesh position={[0, headRadius * 0.05, headRadius * 0.97]} renderOrder={2}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
      <SymbolLayer headRadius={headRadius} />
    </group>
  )
}
