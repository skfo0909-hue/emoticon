// 표정 전환 보간(0.3초) 및 강도(약하게~과장되게) 반영.
import type { ExpressionState } from '../types/character'
import { useCharacterStore } from '../store/useCharacterStore'
import { defaultExpression } from './expressionPresets'

let activeAnimationId = 0

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// intensity: 0(약하게) ~ 1(과장되게), 0.5가 사전에 정의된 기본값
export function scaleExpressionByIntensity(target: ExpressionState, intensity: number): ExpressionState {
  const neutral = defaultExpression()
  const factor = 0.5 + intensity // 0.5 ~ 1.5

  const mix = (n: number, t: number) => n + (t - n) * factor

  return {
    eyes: {
      ...target.eyes,
      size: mix(neutral.eyes.size, target.eyes.size),
      stretchY: mix(neutral.eyes.stretchY, target.eyes.stretchY),
    },
    eyebrow: {
      ...target.eyebrow,
      angle: mix(0, target.eyebrow.angle),
    },
    mouth: {
      ...target.mouth,
      size: mix(neutral.mouth.size, target.mouth.size),
      openness: Math.max(0, Math.min(1, mix(neutral.mouth.openness, target.mouth.openness))),
    },
    blush: {
      ...target.blush,
      intensity: Math.max(0, Math.min(1, mix(0, target.blush.intensity))),
    },
    symbols: target.symbols.map((s) => ({ ...s, scale: s.scale * Math.max(0.4, factor) })),
  }
}

export function transitionToExpression(target: ExpressionState, durationMs = 300) {
  const store = useCharacterStore.getState()
  const start = store.expression
  const myId = ++activeAnimationId
  const startTime = performance.now()

  function step(now: number) {
    if (myId !== activeAnimationId) return
    const t = Math.min(1, (now - startTime) / durationMs)
    const eased = easeInOutCubic(t)

    useCharacterStore.setState({
      expression: {
        eyes: {
          shape: eased > 0.5 ? target.eyes.shape : start.eyes.shape,
          size: lerp(start.eyes.size, target.eyes.size, eased),
          stretchY: lerp(start.eyes.stretchY, target.eyes.stretchY, eased),
          spacing: lerp(start.eyes.spacing, target.eyes.spacing, eased),
          lookX: lerp(start.eyes.lookX, target.eyes.lookX, eased),
          lookY: lerp(start.eyes.lookY, target.eyes.lookY, eased),
        },
        eyebrow: {
          visible: eased > 0.5 ? target.eyebrow.visible : start.eyebrow.visible,
          angle: lerp(start.eyebrow.angle, target.eyebrow.angle, eased),
          height: lerp(start.eyebrow.height, target.eyebrow.height, eased),
        },
        mouth: {
          shape: eased > 0.5 ? target.mouth.shape : start.mouth.shape,
          size: lerp(start.mouth.size, target.mouth.size, eased),
          openness: lerp(start.mouth.openness, target.mouth.openness, eased),
        },
        blush: {
          size: lerp(start.blush.size, target.blush.size, eased),
          intensity: lerp(start.blush.intensity, target.blush.intensity, eased),
        },
        symbols: eased >= 1 ? target.symbols : eased > 0.5 ? target.symbols : start.symbols,
      },
    })

    if (t < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}
