import { useMemo } from 'react'
import { Billboard } from '@react-three/drei'
import { CanvasTexture } from 'three'
import { useCharacterStore } from '../../store/useCharacterStore'
import { SYMBOL_CANVAS_SIZE, drawSymbolToCanvas } from '../../expression/drawSymbol'
import type { FaceSymbol, SymbolPosition } from '../../types/character'

const textureCache = new Map<string, CanvasTexture>()

function getSymbolTexture(kind: FaceSymbol['kind'], lineOnly: boolean): CanvasTexture {
  const key = `${kind}:${lineOnly}`
  let tex = textureCache.get(key)
  if (!tex) {
    const canvas = document.createElement('canvas')
    canvas.width = SYMBOL_CANVAS_SIZE
    canvas.height = SYMBOL_CANVAS_SIZE
    drawSymbolToCanvas(canvas, kind, { lineOnly })
    tex = new CanvasTexture(canvas)
    textureCache.set(key, tex)
  }
  return tex
}

function offsetFor(position: SymbolPosition, headRadius: number): [number, number, number] {
  switch (position) {
    case 'top':
      return [0, headRadius * 1.35, headRadius * 0.2]
    case 'topLeft':
      return [-headRadius * 0.95, headRadius * 1.05, headRadius * 0.2]
    case 'topRight':
      return [headRadius * 0.95, headRadius * 1.05, headRadius * 0.2]
    case 'left':
      return [-headRadius * 1.2, headRadius * 0.05, headRadius * 0.1]
    case 'right':
      return [headRadius * 1.2, headRadius * 0.05, headRadius * 0.1]
  }
}

interface Props {
  headRadius: number
}

// 만화 기호(땀방울/화남 마크/하트 등): 머리를 기준으로 위치가 정해지지만
// 항상 카메라를 향하도록 빌보드 처리한다.
export default function SymbolLayer({ headRadius }: Props) {
  const symbols = useCharacterStore((s) => s.expression.symbols)
  const renderMode = useCharacterStore((s) => s.renderMode)
  const lineOnly = renderMode === 'outline'

  if (symbols.length === 0) return null

  return (
    <>
      {symbols.map((sym) => (
        <SymbolSprite key={sym.id} symbol={sym} headRadius={headRadius} lineOnly={lineOnly} />
      ))}
    </>
  )
}

function SymbolSprite({ symbol, headRadius, lineOnly }: { symbol: FaceSymbol; headRadius: number; lineOnly: boolean }) {
  const texture = useMemo(() => getSymbolTexture(symbol.kind, lineOnly), [symbol.kind, lineOnly])
  const offset = offsetFor(symbol.position, headRadius)
  const size = headRadius * 0.7 * symbol.scale

  return (
    <Billboard position={offset}>
      <mesh renderOrder={3}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
    </Billboard>
  )
}
