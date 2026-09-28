// 만화 기호(땀방울/화남마크/하트/반짝이 등)를 2D 캔버스에 그린다.
// 각 기호는 작은 정사각형 캔버스 텍스처 하나로 만들어 빌보드 스프라이트에 사용한다.
import type { SymbolKind } from '../types/character'

export const SYMBOL_CANVAS_SIZE = 96
const C = SYMBOL_CANVAS_SIZE / 2

export interface DrawSymbolOptions {
  lineOnly?: boolean
}

function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(cx, cy + r * 0.7)
  ctx.bezierCurveTo(cx - r * 1.3, cy - r * 0.3, cx - r * 0.5, cy - r * 1.2, cx, cy - r * 0.35)
  ctx.bezierCurveTo(cx + r * 0.5, cy - r * 1.2, cx + r * 1.3, cy - r * 0.3, cx, cy + r * 0.7)
  ctx.closePath()
}

function sparklePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.quadraticCurveTo(cx + r * 0.15, cy - r * 0.15, cx + r, cy)
  ctx.quadraticCurveTo(cx + r * 0.15, cy + r * 0.15, cx, cy + r)
  ctx.quadraticCurveTo(cx - r * 0.15, cy + r * 0.15, cx - r, cy)
  ctx.quadraticCurveTo(cx - r * 0.15, cy - r * 0.15, cx, cy - r)
  ctx.closePath()
}

// fill 대신 stroke만 쓸지 여부에 따라 채우거나 선으로만 그린다 (외곽선만 모드용).
function fillOrStroke(ctx: CanvasRenderingContext2D, lineOnly: boolean, strokeColor: string, lineWidth = 2) {
  if (lineOnly) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = lineWidth
    ctx.stroke()
  } else {
    ctx.fill()
  }
}

export function drawSymbolToCanvas(canvas: HTMLCanvasElement, kind: SymbolKind, opts: DrawSymbolOptions = {}) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const lineOnly = opts.lineOnly ?? false
  ctx.clearRect(0, 0, SYMBOL_CANVAS_SIZE, SYMBOL_CANVAS_SIZE)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (kind) {
    case 'sweat': {
      ctx.fillStyle = '#6fb6e6'
      ctx.beginPath()
      ctx.moveTo(C, C - 26)
      ctx.quadraticCurveTo(C + 20, C + 8, C, C + 26)
      ctx.quadraticCurveTo(C - 20, C + 8, C, C - 26)
      ctx.closePath()
      fillOrStroke(ctx, lineOnly, '#2c6fa6', 2.5)
      break
    }
    case 'tear': {
      ctx.beginPath()
      ctx.moveTo(C, C - 34)
      ctx.quadraticCurveTo(C + 14, C + 20, C, C + 34)
      ctx.quadraticCurveTo(C - 14, C + 20, C, C - 34)
      ctx.closePath()
      if (lineOnly) {
        ctx.strokeStyle = '#2c6fa6'
        ctx.lineWidth = 2.5
        ctx.stroke()
      } else {
        ctx.fillStyle = '#7ec4f0'
        ctx.fill()
        ctx.strokeStyle = '#2c6fa6'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      break
    }
    case 'angerMark': {
      ctx.strokeStyle = '#d1483f'
      ctx.lineWidth = lineOnly ? 3.5 : 7
      const arms = 4
      for (let i = 0; i < arms; i++) {
        const a = (i / arms) * Math.PI * 2 + Math.PI / 4
        ctx.beginPath()
        ctx.moveTo(C, C)
        ctx.lineTo(C + Math.cos(a) * 30, C + Math.sin(a) * 30)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(C, C, 8, 0, Math.PI * 2)
      if (lineOnly) ctx.stroke()
      else {
        ctx.fillStyle = '#d1483f'
        ctx.fill()
      }
      break
    }
    case 'heart': {
      ctx.fillStyle = '#e8697a'
      heartPath(ctx, C, C, 26)
      fillOrStroke(ctx, lineOnly, '#c9505f', 2.5)
      break
    }
    case 'heartMulti': {
      ctx.fillStyle = '#e8697a'
      heartPath(ctx, C - 18, C + 6, 14)
      fillOrStroke(ctx, lineOnly, '#c9505f', 2)
      heartPath(ctx, C + 16, C - 10, 18)
      fillOrStroke(ctx, lineOnly, '#c9505f', 2)
      heartPath(ctx, C + 2, C + 22, 10)
      fillOrStroke(ctx, lineOnly, '#c9505f', 2)
      break
    }
    case 'sparkle': {
      ctx.fillStyle = '#f4c94f'
      sparklePath(ctx, C, C, 24)
      fillOrStroke(ctx, lineOnly, '#c9a12f', 2)
      sparklePath(ctx, C + 22, C - 18, 10)
      fillOrStroke(ctx, lineOnly, '#c9a12f', 1.5)
      sparklePath(ctx, C - 20, C + 16, 8)
      fillOrStroke(ctx, lineOnly, '#c9a12f', 1.5)
      break
    }
    case 'question': {
      ctx.font = 'bold 60px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      if (lineOnly) {
        ctx.strokeStyle = '#3a3226'
        ctx.lineWidth = 1.6
        ctx.strokeText('?', C, C + 2)
      } else {
        ctx.fillStyle = '#3a3226'
        ctx.fillText('?', C, C + 2)
      }
      break
    }
    case 'exclaim': {
      ctx.font = 'bold 60px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      if (lineOnly) {
        ctx.strokeStyle = '#3a3226'
        ctx.lineWidth = 1.6
        ctx.strokeText('!', C, C + 2)
      } else {
        ctx.fillStyle = '#3a3226'
        ctx.fillText('!', C, C + 2)
      }
      break
    }
    case 'note': {
      ctx.font = 'bold 46px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      if (lineOnly) {
        ctx.strokeStyle = '#3a3226'
        ctx.lineWidth = 1.4
        ctx.strokeText('♪', C, C + 2)
      } else {
        ctx.fillStyle = '#3a3226'
        ctx.fillText('♪', C, C + 2)
      }
      break
    }
    case 'zzz': {
      ctx.textBaseline = 'middle'
      const draw = (text: string, x: number, y: number, size: number) => {
        ctx.font = `bold ${size}px sans-serif`
        if (lineOnly) {
          ctx.strokeStyle = '#3a3226'
          ctx.lineWidth = 1.2
          ctx.strokeText(text, x, y)
        } else {
          ctx.fillStyle = '#3a3226'
          ctx.fillText(text, x, y)
        }
      }
      draw('Z', C - 22, C + 14, 34)
      draw('Z', C + 4, C - 4, 24)
      draw('Z', C + 24, C - 22, 16)
      break
    }
    case 'shake': {
      ctx.strokeStyle = '#3a3226'
      ctx.lineWidth = 3
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        const x = C + i * 16
        ctx.moveTo(x, C - 28)
        ctx.quadraticCurveTo(x + 8, C, x, C + 28)
        ctx.stroke()
      }
      break
    }
    case 'gloom': {
      ctx.beginPath()
      ctx.ellipse(C, C - 16, 26, 14, 0, 0, Math.PI * 2)
      ctx.ellipse(C - 16, C - 10, 16, 11, 0, 0, Math.PI * 2)
      ctx.ellipse(C + 16, C - 10, 16, 11, 0, 0, Math.PI * 2)
      if (lineOnly) {
        ctx.strokeStyle = '#6b7280'
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        ctx.fillStyle = '#8b93a0'
        ctx.fill()
      }
      ctx.strokeStyle = '#6b7280'
      ctx.lineWidth = 2.5
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(C + i * 14, C + 6)
        ctx.lineTo(C + i * 14 - 4, C + 22)
        ctx.stroke()
      }
      break
    }
    case 'snot': {
      ctx.beginPath()
      ctx.ellipse(C, C + 6, 16, 20, 0, 0, Math.PI * 2)
      if (lineOnly) {
        ctx.strokeStyle = 'rgba(120,150,100,0.9)'
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        ctx.fillStyle = 'rgba(180,210,160,0.7)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(120,150,100,0.8)'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      break
    }
  }
}
