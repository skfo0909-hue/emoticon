import { useEffect, useRef } from 'react'
import { FACE_CANVAS_SIZE, drawFaceToCanvas } from '../../expression/drawFace'
import type { ExpressionState } from '../../types/character'
import { BODY_COLOR } from '../../three/materials'

interface Props {
  expression: ExpressionState
  size?: number
}

// 이모지 대신 캐릭터 얼굴 썸네일(피부색 원 + 그려진 표정)로 보여주는 작은 미리보기.
export default function EmotionThumbnail({ expression, size = 40 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, FACE_CANVAS_SIZE, FACE_CANVAS_SIZE)
    ctx.beginPath()
    ctx.arc(FACE_CANVAS_SIZE / 2, FACE_CANVAS_SIZE / 2, FACE_CANVAS_SIZE / 2 - 4, 0, Math.PI * 2)
    ctx.fillStyle = BODY_COLOR
    ctx.fill()
    drawFaceToCanvas(canvas, expression, { lineOnly: false })
  }, [expression])

  return (
    <canvas
      ref={canvasRef}
      width={FACE_CANVAS_SIZE}
      height={FACE_CANVAS_SIZE}
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  )
}
