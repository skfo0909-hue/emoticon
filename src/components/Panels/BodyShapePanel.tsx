import type { BodyProportions, HeadRatioPreset } from '../../types/character'
import { useCharacterStore } from '../../store/useCharacterStore'

const HEAD_RATIO_PRESETS: HeadRatioPreset[] = [2, 2.5, 3, 4]

const SLIDERS: { key: keyof BodyProportions; label: string; min: number; max: number }[] = [
  { key: 'headSize', label: '머리 크기', min: 0.6, max: 1.6 },
  { key: 'armLength', label: '팔 길이', min: 0.5, max: 1.6 },
  { key: 'legLength', label: '다리 길이', min: 0.5, max: 1.6 },
  { key: 'torsoLength', label: '몸통 길이', min: 0.5, max: 1.6 },
  { key: 'chubbiness', label: '통통함', min: 0.6, max: 1.7 },
  { key: 'handFootSize', label: '손발 크기', min: 0.5, max: 1.8 },
]

export default function BodyShapePanel() {
  const proportions = useCharacterStore((s) => s.proportions)
  const headRatioPreset = useCharacterStore((s) => s.headRatioPreset)
  const setProportion = useCharacterStore((s) => s.setProportion)
  const applyHeadRatioPreset = useCharacterStore((s) => s.applyHeadRatioPreset)

  return (
    <div className="panel-card">
      <h2 className="panel-title">체형</h2>

      <div className="mb-4">
        <div className="panel-subtitle">등신 프리셋</div>
        <div className="grid grid-cols-4 gap-2">
          {HEAD_RATIO_PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => applyHeadRatioPreset(n)}
              className={`preset-btn ${headRatioPreset === n ? 'preset-btn-active' : ''}`}
            >
              {n}등신
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {SLIDERS.map((s) => (
          <label key={s.key} className="flex flex-col gap-1 text-sm">
            <span className="flex justify-between text-[var(--ink)]">
              <span>{s.label}</span>
              <span className="text-[var(--accent)] font-medium">{proportions[s.key].toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={0.01}
              value={proportions[s.key]}
              onChange={(e) => setProportion(s.key, parseFloat(e.target.value))}
              className="hand-slider"
            />
          </label>
        ))}
      </div>
    </div>
  )
}
