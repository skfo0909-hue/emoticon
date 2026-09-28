// 표정(눈/눈썹/입/볼터치)을 2D 캔버스에 그려 CanvasTexture로 쓴다.
// 머리 표면에 개별 3D 메쉬를 배치하는 대신 캔버스 텍스처를 쓰는 이유:
// 점/원/웃는눈/감은눈/울상/X/별/하트/소용돌이 같은 다양한 눈 모양과
// 입 모양(D자/ㅅ/물결/이빨 등)을 3D 지오메트리로 일일이 만드는 것보다
// 2D 패스(호, 베지어, 별/하트 좌표)로 그리는 편이 훨씬 간단하고,
// "외곽선만" 모드에서 표정을 선으로만 그리는 것도 캔버스에서 쉽게 처리된다.
import type { EyeShape, ExpressionState, MouthShape } from '../types/character'

export const FACE_CANVAS_SIZE = 256
const CENTER = FACE_CANVAS_SIZE / 2

export interface DrawFaceOptions {
  lineOnly: boolean // 외곽선만 모드
  lineColor?: string
  fillColor?: string
}

function px(v: number) {
  return CENTER + v
}

function strokeStyleFor(opts: DrawFaceOptions) {
  return opts.lineColor ?? '#241c14'
}

function drawEyeShape(
  ctx: CanvasRenderingContext2D,
  shape: EyeShape,
  cx: number,
  cy: number,
  size: number,
  stretchY: number,
  lookX: number,
  lookY: number,
  opts: DrawFaceOptions,
) {
  const r = 12 * size
  const ry = r * stretchY
  const ox = cx + lookX * r * 0.5
  const oy = cy + lookY * r * 0.5
  ctx.save()
  ctx.translate(ox, oy)
  ctx.lineWidth = Math.max(2.5, 3 * size)
  ctx.strokeStyle = strokeStyleFor(opts)
  ctx.fillStyle = opts.fillColor ?? strokeStyleFor(opts)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (shape) {
    case 'dot': {
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 0.45, ry * 0.45, 0, 0, Math.PI * 2)
      if (opts.lineOnly) ctx.stroke()
      else ctx.fill()
      break
    }
    case 'circle': {
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 0.75, ry * 0.75, 0, 0, Math.PI * 2)
      if (opts.lineOnly) ctx.stroke()
      else ctx.fill()
      if (!opts.lineOnly) {
        ctx.beginPath()
        ctx.fillStyle = '#fff'
        ctx.ellipse(-r * 0.22, -ry * 0.22, r * 0.2, ry * 0.2, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
    case 'smile': {
      ctx.beginPath()
      ctx.arc(0, ry * 0.2, r * 0.8, Math.PI * 1.12, Math.PI * 1.88)
      ctx.stroke()
      break
    }
    case 'closed': {
      ctx.beginPath()
      ctx.moveTo(-r * 0.85, 0)
      ctx.lineTo(r * 0.85, 0)
      ctx.stroke()
      break
    }
    case 'sad': {
      ctx.beginPath()
      ctx.arc(0, -ry * 0.35, r * 0.75, Math.PI * 0.15, Math.PI * 0.85)
      ctx.stroke()
      // 눈물 방울
      ctx.beginPath()
      ctx.ellipse(0, ry * 0.65, r * 0.28, ry * 0.42, 0, 0, Math.PI * 2)
      ctx.fillStyle = opts.lineOnly ? 'transparent' : 'rgba(120,170,220,0.85)'
      if (opts.lineOnly) ctx.stroke()
      else {
        ctx.fill()
        ctx.stroke()
      }
      break
    }
    case 'x': {
      ctx.beginPath()
      ctx.moveTo(-r * 0.7, -ry * 0.7)
      ctx.lineTo(r * 0.7, ry * 0.7)
      ctx.moveTo(r * 0.7, -ry * 0.7)
      ctx.lineTo(-r * 0.7, ry * 0.7)
      ctx.stroke()
      break
    }
    case 'star': {
      drawStarPath(ctx, 0, 0, r * 0.85, ry * 0.85, 5)
      if (opts.lineOnly) ctx.stroke()
      else ctx.fill()
      break
    }
    case 'heart': {
      drawHeartPath(ctx, 0, 0, r * 0.85, ry * 0.85)
      if (opts.lineOnly) ctx.stroke()
      else ctx.fill()
      break
    }
    case 'spiral': {
      ctx.beginPath()
      const turns = 2.2
      const steps = 40
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const ang = t * Math.PI * 2 * turns
        const rad = t * r * 0.85
        const x = Math.cos(ang) * rad
        const y = Math.sin(ang) * rad * (ry / r)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      break
    }
  }
  ctx.restore()
}

function drawStarPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, points: number) {
  ctx.beginPath()
  const step = Math.PI / points
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? 1 : 0.42
    const ang = i * step - Math.PI / 2
    const x = cx + Math.cos(ang) * rx * rad
    const y = cy + Math.sin(ang) * ry * rad
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function drawHeartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.beginPath()
  ctx.moveTo(cx, cy + ry * 0.6)
  ctx.bezierCurveTo(cx - rx * 1.3, cy - ry * 0.4, cx - rx * 0.5, cy - ry * 1.2, cx, cy - ry * 0.35)
  ctx.bezierCurveTo(cx + rx * 0.5, cy - ry * 1.2, cx + rx * 1.3, cy - ry * 0.4, cx, cy + ry * 0.6)
  ctx.closePath()
}

function drawEyebrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  side: 1 | -1,
  angleDeg: number,
  opts: DrawFaceOptions,
) {
  const len = 22
  const angle = (angleDeg * Math.PI) / 180
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle * side)
  ctx.lineWidth = 4.2
  ctx.lineCap = 'round'
  ctx.strokeStyle = strokeStyleFor(opts)
  ctx.beginPath()
  ctx.moveTo(-len / 2, 0)
  ctx.lineTo(len / 2, 0)
  ctx.stroke()
  ctx.restore()
}

function drawMouthShape(
  ctx: CanvasRenderingContext2D,
  shape: MouthShape,
  cx: number,
  cy: number,
  size: number,
  openness: number,
  opts: DrawFaceOptions,
) {
  const w = 19 * size
  const h = Math.max(2, 14 * size * openness)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.lineWidth = Math.max(2.5, 3 * size)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = strokeStyleFor(opts)
  ctx.fillStyle = opts.fillColor ?? strokeStyleFor(opts)

  switch (shape) {
    case 'smallSmile': {
      ctx.beginPath()
      ctx.arc(0, -h * 0.3, w * 0.55, Math.PI * 0.12, Math.PI * 0.88)
      ctx.stroke()
      break
    }
    case 'bigSmile': {
      ctx.beginPath()
      ctx.arc(0, -h * 0.1, w * 0.75, Math.PI * 0.06, Math.PI * 0.94)
      ctx.stroke()
      if (!opts.lineOnly) {
        ctx.lineTo(-w * 0.75 * Math.cos(Math.PI * 0.06), h * 0.15)
        ctx.closePath()
        ctx.fillStyle = '#8a4b42'
        ctx.fill()
      }
      break
    }
    case 'openD': {
      ctx.beginPath()
      ctx.moveTo(-w * 0.55, -h * 0.3)
      ctx.quadraticCurveTo(0, -h * 0.5, w * 0.55, -h * 0.3)
      ctx.quadraticCurveTo(w * 0.62, h * 0.55, 0, h * 0.65)
      ctx.quadraticCurveTo(-w * 0.62, h * 0.55, -w * 0.55, -h * 0.3)
      ctx.closePath()
      if (opts.lineOnly) ctx.stroke()
      else {
        ctx.fillStyle = '#6b3a32'
        ctx.fill()
        ctx.stroke()
      }
      break
    }
    case 'siot': {
      ctx.beginPath()
      ctx.moveTo(-w * 0.5, h * 0.25)
      ctx.lineTo(0, -h * 0.35)
      ctx.lineTo(w * 0.5, h * 0.25)
      ctx.stroke()
      break
    }
    case 'wave': {
      ctx.beginPath()
      ctx.moveTo(-w * 0.7, 0)
      for (let i = 0; i <= 4; i++) {
        const t = i / 4
        const x = -w * 0.7 + t * w * 1.4
        const y = Math.sin(t * Math.PI * 2) * h * 0.35
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      break
    }
    case 'o': {
      ctx.beginPath()
      ctx.ellipse(0, 0, w * 0.4, h * 0.55, 0, 0, Math.PI * 2)
      if (opts.lineOnly) ctx.stroke()
      else {
        ctx.fillStyle = '#6b3a32'
        ctx.fill()
        ctx.stroke()
      }
      break
    }
    case 'pout': {
      ctx.beginPath()
      ctx.ellipse(0, 0, w * 0.32, h * 0.4, 0, 0, Math.PI * 2)
      if (opts.lineOnly) ctx.stroke()
      else ctx.fill()
      break
    }
    case 'teeth': {
      ctx.beginPath()
      ctx.moveTo(-w * 0.6, -h * 0.2)
      ctx.quadraticCurveTo(0, -h * 0.5, w * 0.6, -h * 0.2)
      ctx.quadraticCurveTo(w * 0.6, h * 0.5, 0, h * 0.6)
      ctx.quadraticCurveTo(-w * 0.6, h * 0.5, -w * 0.6, -h * 0.2)
      ctx.closePath()
      if (opts.lineOnly) ctx.stroke()
      else {
        ctx.fillStyle = '#6b3a32'
        ctx.fill()
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(-w * 0.55, -h * 0.12)
      ctx.lineTo(w * 0.55, -h * 0.12)
      ctx.stroke()
      break
    }
  }
  ctx.restore()
}

function drawBlush(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  side: 1 | -1,
  size: number,
  intensity: number,
  opts: DrawFaceOptions,
) {
  if (size <= 0 || intensity <= 0) return
  ctx.save()
  ctx.translate(cx, cy)
  const r = 12 * size
  ctx.beginPath()
  ctx.ellipse(0, 0, r, r * 0.62, 0, 0, Math.PI * 2)
  if (opts.lineOnly) {
    ctx.strokeStyle = strokeStyleFor(opts)
    ctx.lineWidth = 1.6
    ctx.globalAlpha = Math.min(1, 0.4 + intensity * 0.6)
    ctx.stroke()
  } else {
    ctx.fillStyle = `rgba(230,120,110,${0.5 * intensity})`
    ctx.fill()
  }
  ctx.restore()
  void side
}

export function drawFaceToCanvas(canvas: HTMLCanvasElement, expression: ExpressionState, opts: DrawFaceOptions) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, FACE_CANVAS_SIZE, FACE_CANVAS_SIZE)

  const { eyes, eyebrow, mouth, blush } = expression
  const eyeSpacing = 34 * eyes.spacing

  drawBlush(ctx, px(-eyeSpacing * 1.05), px(22), -1, blush.size, blush.intensity, opts)
  drawBlush(ctx, px(eyeSpacing * 1.05), px(22), 1, blush.size, blush.intensity, opts)

  drawEyeShape(ctx, eyes.shape, px(-eyeSpacing), px(-6), eyes.size, eyes.stretchY, eyes.lookX, eyes.lookY, opts)
  drawEyeShape(ctx, eyes.shape, px(eyeSpacing), px(-6), eyes.size, eyes.stretchY, eyes.lookX, eyes.lookY, opts)

  if (eyebrow.visible) {
    drawEyebrow(ctx, px(-eyeSpacing), px(-24 - eyebrow.height), -1, eyebrow.angle, opts)
    drawEyebrow(ctx, px(eyeSpacing), px(-24 - eyebrow.height), 1, eyebrow.angle, opts)
  }

  drawMouthShape(ctx, mouth.shape, px(0), px(46), mouth.size, mouth.openness, opts)
}
