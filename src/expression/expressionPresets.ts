import type { ExpressionState } from '../types/character'

export function defaultExpression(): ExpressionState {
  return {
    eyes: { shape: 'dot', size: 1, stretchY: 1, spacing: 1, lookX: 0, lookY: 0 },
    eyebrow: { visible: false, angle: 0, height: 0 },
    mouth: { shape: 'smallSmile', size: 1, openness: 0.3 },
    blush: { size: 0, intensity: 0 },
    symbols: [],
  }
}
