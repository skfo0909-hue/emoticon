import { useState } from 'react'
import { useCharacterStore } from '../../store/useCharacterStore'
import {
  EMOTION_DICTIONARY,
  buildExpressionFromSpec,
  getEmotionPose,
  resolveEmotion,
  type EmotionEntry,
} from '../../data/emotionDictionary'
import { defaultExpression } from '../../expression/expressionPresets'
import { scaleExpressionByIntensity, transitionToExpression } from '../../expression/expressionTransition'
import { transitionToPose } from '../../pose/poseTransition'
import EmotionThumbnail from '../Face/EmotionThumbnail'
import type { EyeShape, FaceSymbol, MouthShape, SymbolPosition } from '../../types/character'
import type { SavedExpression } from '../../store/useCharacterStore'

const QUICK_EMOTION_IDS = ['joy', 'excited', 'love', 'sad', 'angry', 'surprised', 'shy', 'sleepy']

const EYE_SHAPES: { key: EyeShape; label: string }[] = [
  { key: 'dot', label: '점' },
  { key: 'circle', label: '동그라미' },
  { key: 'smile', label: '웃는눈' },
  { key: 'closed', label: '감은눈' },
  { key: 'sad', label: '울상' },
  { key: 'x', label: 'X자' },
  { key: 'star', label: '별' },
  { key: 'heart', label: '하트' },
  { key: 'spiral', label: '소용돌이' },
]

const MOUTH_SHAPES: { key: MouthShape; label: string }[] = [
  { key: 'smallSmile', label: '작은미소' },
  { key: 'bigSmile', label: '활짝웃음' },
  { key: 'openD', label: 'D자' },
  { key: 'siot', label: 'ㅅ' },
  { key: 'wave', label: '물결' },
  { key: 'o', label: 'O자' },
  { key: 'pout', label: '삐죽' },
  { key: 'teeth', label: '이빨' },
]

const SYMBOL_KINDS: { key: FaceSymbol['kind']; label: string }[] = [
  { key: 'sweat', label: '땀방울' },
  { key: 'angerMark', label: '분노마크' },
  { key: 'heart', label: '하트' },
  { key: 'heartMulti', label: '하트여러개' },
  { key: 'sparkle', label: '반짝이' },
  { key: 'question', label: '물음표' },
  { key: 'exclaim', label: '느낌표' },
  { key: 'shake', label: '떨림선' },
  { key: 'gloom', label: '그늘선' },
  { key: 'tear', label: '눈물줄기' },
  { key: 'snot', label: '콧방울' },
  { key: 'note', label: '음표' },
  { key: 'zzz', label: 'Zzz' },
]

export default function ExpressionPanel() {
  const expression = useCharacterStore((s) => s.expression)
  const setExpression = useCharacterStore((s) => s.setExpression)
  const savedExpressions = useCharacterStore((s) => s.savedExpressions)
  const addSavedExpression = useCharacterStore((s) => s.addSavedExpression)
  const removeSavedExpression = useCharacterStore((s) => s.removeSavedExpression)

  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<EmotionEntry[]>([])
  const [notFound, setNotFound] = useState(false)
  const [intensity, setIntensity] = useState(0.5)
  const [applyPoseToo, setApplyPoseToo] = useState(true)
  const [manualOpen, setManualOpen] = useState(false)
  const [symbolsOpen, setSymbolsOpen] = useState(false)
  const [saveName, setSaveName] = useState('')

  const applyEmotionEntry = (entry: EmotionEntry) => {
    const base = buildExpressionFromSpec(entry.expression, defaultExpression())
    const scaled = scaleExpressionByIntensity(base, intensity)
    transitionToExpression(scaled)
    if (applyPoseToo) {
      const pose = getEmotionPose(entry)
      if (pose) transitionToPose(pose)
    }
    setSuggestions([])
    setNotFound(false)
  }

  const handleSubmit = () => {
    if (!input.trim()) return
    const { matched, suggestions: sug } = resolveEmotion(input)
    if (matched) {
      applyEmotionEntry(matched)
    } else if (sug.length > 0) {
      setSuggestions(sug)
      setNotFound(false)
    } else {
      setNotFound(true)
      setSuggestions([])
    }
  }

  const handleSaveExpression = () => {
    const name = saveName.trim() || `내 표정 ${savedExpressions.length + 1}`
    const saved: SavedExpression = { id: `expr-${Date.now()}`, name, expression, createdAt: Date.now() }
    addSavedExpression(saved)
    setSaveName('')
  }

  const toggleSymbol = (kind: FaceSymbol['kind']) => {
    const exists = expression.symbols.find((s) => s.kind === kind)
    if (exists) {
      setExpression({ symbols: expression.symbols.filter((s) => s.kind !== kind) })
    } else {
      const positions: SymbolPosition[] = ['topRight', 'topLeft', 'top', 'right', 'left']
      const pos = positions[expression.symbols.length % positions.length]
      const sym: FaceSymbol = { id: `sym-${Date.now()}`, kind, position: pos, scale: 1 }
      setExpression({ symbols: [...expression.symbols, sym] })
    }
  }

  return (
    <div className="panel-card">
      <h2 className="panel-title">표정</h2>

      <div className="flex gap-1 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="감정을 입력하세요 (예: 신남, 삐짐, 당황)"
          className="flex-1 min-w-0 rounded-lg border px-2 py-1 text-sm"
          style={{ borderColor: 'var(--card-border)' }}
        />
        <button className="icon-toggle" onClick={handleSubmit}>
          적용
        </button>
      </div>

      {notFound && <div className="text-xs opacity-60 mb-2">일치하는 감정을 찾지 못했어요.</div>}

      {suggestions.length > 0 && (
        <div className="flex gap-1 mb-2">
          {suggestions.map((s) => (
            <button key={s.id} className="icon-toggle" onClick={() => applyEmotionEntry(s)}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm mb-2">
        <span className="flex justify-between">
          <span>강도 (약하게~과장되게)</span>
          <span className="text-[var(--accent)] font-medium">{Math.round(intensity * 100)}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={intensity}
          onChange={(e) => setIntensity(parseFloat(e.target.value))}
          className="hand-slider"
        />
      </label>

      <label className="flex items-center gap-2 text-sm mb-3">
        <input type="checkbox" checked={applyPoseToo} onChange={(e) => setApplyPoseToo(e.target.checked)} />
        포즈도 함께 적용
      </label>

      <div className="panel-subtitle">자주 쓰는 감정</div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {QUICK_EMOTION_IDS.map((id) => {
          const entry = EMOTION_DICTIONARY.find((e) => e.id === id)!
          const preview = buildExpressionFromSpec(entry.expression, defaultExpression())
          return (
            <button
              key={id}
              className="flex flex-col items-center gap-1"
              onClick={() => applyEmotionEntry(entry)}
              title={entry.name}
            >
              <EmotionThumbnail expression={preview} size={40} />
              <span className="text-[10px]">{entry.name}</span>
            </button>
          )
        })}
      </div>

      <button className="icon-toggle w-full mb-3" onClick={() => setManualOpen((v) => !v)}>
        부품별 수동 조절 {manualOpen ? '▲' : '▼'}
      </button>
      {manualOpen && (
        <div className="flex flex-col gap-3 mb-3 text-sm">
          <div>
            <div className="panel-subtitle">눈</div>
            <div className="grid grid-cols-3 gap-1 mb-1">
              {EYE_SHAPES.map((s) => (
                <button
                  key={s.key}
                  className={`preset-btn !text-[10px] ${expression.eyes.shape === s.key ? 'preset-btn-active' : ''}`}
                  onClick={() => setExpression({ eyes: { ...expression.eyes, shape: s.key } })}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <MiniSlider
              label="크기"
              value={expression.eyes.size}
              min={0.5}
              max={1.8}
              onChange={(v) => setExpression({ eyes: { ...expression.eyes, size: v } })}
            />
            <MiniSlider
              label="세로 늘림"
              value={expression.eyes.stretchY}
              min={0.4}
              max={1.8}
              onChange={(v) => setExpression({ eyes: { ...expression.eyes, stretchY: v } })}
            />
            <MiniSlider
              label="간격"
              value={expression.eyes.spacing}
              min={0.6}
              max={1.5}
              onChange={(v) => setExpression({ eyes: { ...expression.eyes, spacing: v } })}
            />
            <MiniSlider
              label="시선 좌우"
              value={expression.eyes.lookX}
              min={-1}
              max={1}
              onChange={(v) => setExpression({ eyes: { ...expression.eyes, lookX: v } })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="panel-subtitle mb-0">눈썹</div>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={expression.eyebrow.visible}
                  onChange={(e) => setExpression({ eyebrow: { ...expression.eyebrow, visible: e.target.checked } })}
                />
                표시
              </label>
            </div>
            <MiniSlider
              label="기울기(화남↔슬픔)"
              value={expression.eyebrow.angle}
              min={-30}
              max={30}
              onChange={(v) => setExpression({ eyebrow: { ...expression.eyebrow, angle: v } })}
            />
          </div>

          <div>
            <div className="panel-subtitle">입</div>
            <div className="grid grid-cols-4 gap-1 mb-1">
              {MOUTH_SHAPES.map((s) => (
                <button
                  key={s.key}
                  className={`preset-btn !text-[10px] ${expression.mouth.shape === s.key ? 'preset-btn-active' : ''}`}
                  onClick={() => setExpression({ mouth: { ...expression.mouth, shape: s.key } })}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <MiniSlider
              label="크기"
              value={expression.mouth.size}
              min={0.5}
              max={1.8}
              onChange={(v) => setExpression({ mouth: { ...expression.mouth, size: v } })}
            />
            <MiniSlider
              label="벌림 정도"
              value={expression.mouth.openness}
              min={0}
              max={1}
              onChange={(v) => setExpression({ mouth: { ...expression.mouth, openness: v } })}
            />
          </div>

          <div>
            <div className="panel-subtitle">볼터치</div>
            <MiniSlider
              label="크기"
              value={expression.blush.size}
              min={0}
              max={2}
              onChange={(v) => setExpression({ blush: { ...expression.blush, size: v } })}
            />
            <MiniSlider
              label="진하기"
              value={expression.blush.intensity}
              min={0}
              max={1}
              onChange={(v) => setExpression({ blush: { ...expression.blush, intensity: v } })}
            />
          </div>
        </div>
      )}

      <button className="icon-toggle w-full mb-3" onClick={() => setSymbolsOpen((v) => !v)}>
        만화 기호 {symbolsOpen ? '▲' : '▼'}
      </button>
      {symbolsOpen && (
        <div className="grid grid-cols-4 gap-1 mb-3">
          {SYMBOL_KINDS.map((s) => {
            const active = expression.symbols.some((sym) => sym.kind === s.key)
            return (
              <button
                key={s.key}
                className={`preset-btn !text-[10px] ${active ? 'preset-btn-active' : ''}`}
                onClick={() => toggleSymbol(s.key)}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex gap-1 mb-2">
        <input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="표정 이름"
          className="flex-1 min-w-0 rounded-lg border px-2 py-1 text-sm"
          style={{ borderColor: 'var(--card-border)' }}
        />
        <button className="icon-toggle" onClick={handleSaveExpression}>
          내 표정 저장
        </button>
      </div>

      {savedExpressions.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {savedExpressions.map((se) => (
            <div key={se.id} className="relative flex flex-col items-center gap-1">
              <button onClick={() => setExpression(se.expression)} title={se.name}>
                <EmotionThumbnail expression={se.expression} size={40} />
              </button>
              <span className="text-[10px] truncate w-full text-center">{se.name}</span>
              <button
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] leading-none"
                onClick={() => removeSavedExpression(se.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MiniSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-0.5 text-xs mb-1">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="opacity-60">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="hand-slider"
      />
    </label>
  )
}
