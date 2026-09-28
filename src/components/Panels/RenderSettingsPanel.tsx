import { useState } from 'react'
import { useCharacterStore } from '../../store/useCharacterStore'
import type { RenderMode, ViewToggles } from '../../store/useCharacterStore'
import { downloadDataURL, renderCharacterToDataURL } from '../../three/exportRenderer'

type CanvasPreset = 360 | 720 | 1080 | 'free'

const RENDER_MODES: { key: RenderMode; label: string }[] = [
  { key: 'toon', label: '툰 셰이딩' },
  { key: 'outline', label: '외곽선만' },
  { key: 'silhouette', label: '실루엣' },
]

const TOGGLES: { key: keyof ViewToggles; label: string }[] = [
  { key: 'grid', label: '바닥 그리드' },
  { key: 'floorShadow', label: '바닥 그림자' },
  { key: 'jointHandles', label: '관절 핸들' },
  { key: 'skeletonLines', label: '뼈대선' },
]

export default function RenderSettingsPanel() {
  const renderMode = useCharacterStore((s) => s.renderMode)
  const setRenderMode = useCharacterStore((s) => s.setRenderMode)
  const light = useCharacterStore((s) => s.light)
  const setLight = useCharacterStore((s) => s.setLight)
  const viewToggles = useCharacterStore((s) => s.viewToggles)
  const toggleViewOption = useCharacterStore((s) => s.toggleViewOption)
  const proportions = useCharacterStore((s) => s.proportions)
  const pose = useCharacterStore((s) => s.pose)

  const [transparent, setTransparent] = useState(true)
  const [preset, setPreset] = useState<CanvasPreset>(720)
  const [customW, setCustomW] = useState(800)
  const [customH, setCustomH] = useState(800)
  const [exporting, setExporting] = useState(false)

  const handleExportPng = () => {
    setExporting(true)
    try {
      const size = preset === 'free' ? { width: customW, height: customH } : { width: preset, height: preset }
      const dataUrl = renderCharacterToDataURL(proportions, pose, {
        ...size,
        transparent,
        renderMode,
        light,
      })
      downloadDataURL(dataUrl, `character-${Date.now()}.png`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="panel-card">
      <h2 className="panel-title">렌더 &amp; 조명</h2>

      <div className="mb-4">
        <div className="panel-subtitle">렌더 모드</div>
        <div className="grid grid-cols-3 gap-2">
          {RENDER_MODES.map((m) => (
            <button
              key={m.key}
              className={`preset-btn ${renderMode === m.key ? 'preset-btn-active' : ''}`}
              onClick={() => setRenderMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="panel-subtitle mb-0">조명</div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="flex justify-between">
            <span>방위각</span>
            <span className="text-[var(--accent)] font-medium">{Math.round(light.azimuth)}°</span>
          </span>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={light.azimuth}
            onChange={(e) => setLight({ azimuth: parseFloat(e.target.value) })}
            className="hand-slider"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="flex justify-between">
            <span>고도</span>
            <span className="text-[var(--accent)] font-medium">{Math.round(light.elevation)}°</span>
          </span>
          <input
            type="range"
            min={5}
            max={85}
            step={1}
            value={light.elevation}
            onChange={(e) => setLight({ elevation: parseFloat(e.target.value) })}
            className="hand-slider"
          />
        </label>
        <button
          className={`icon-toggle self-start ${light.shadow ? 'icon-toggle-active' : ''}`}
          onClick={() => setLight({ shadow: !light.shadow })}
        >
          그림자 {light.shadow ? 'ON' : 'OFF'}
        </button>
      </div>

      <div>
        <div className="panel-subtitle">표시 옵션</div>
        <div className="grid grid-cols-2 gap-2">
          {TOGGLES.map((t) => (
            <button
              key={t.key}
              className={`icon-toggle ${viewToggles[t.key] ? 'icon-toggle-active' : ''}`}
              onClick={() => toggleViewOption(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <div className="panel-subtitle">PNG 내보내기</div>
        <button
          className={`icon-toggle mb-2 ${transparent ? 'icon-toggle-active' : ''}`}
          onClick={() => setTransparent((v) => !v)}
        >
          투명 배경 {transparent ? 'ON' : 'OFF'}
        </button>
        <div className="grid grid-cols-4 gap-1 mb-2">
          {([360, 720, 1080, 'free'] as CanvasPreset[]).map((p) => (
            <button
              key={String(p)}
              className={`preset-btn !text-[11px] ${preset === p ? 'preset-btn-active' : ''}`}
              onClick={() => setPreset(p)}
            >
              {p === 'free' ? '자유' : `${p}`}
            </button>
          ))}
        </div>
        {preset === 'free' && (
          <div className="flex items-center gap-1 mb-2 text-sm">
            <input
              type="number"
              min={64}
              max={4096}
              value={customW}
              onChange={(e) => setCustomW(parseInt(e.target.value) || 64)}
              className="w-16 rounded-lg border px-1 py-0.5"
              style={{ borderColor: 'var(--card-border)' }}
            />
            <span>×</span>
            <input
              type="number"
              min={64}
              max={4096}
              value={customH}
              onChange={(e) => setCustomH(parseInt(e.target.value) || 64)}
              className="w-16 rounded-lg border px-1 py-0.5"
              style={{ borderColor: 'var(--card-border)' }}
            />
          </div>
        )}
        <button className="preset-btn-active w-full rounded-xl py-1.5" onClick={handleExportPng} disabled={exporting}>
          {exporting ? '내보내는 중…' : 'PNG로 내보내기'}
        </button>
      </div>
    </div>
  )
}
