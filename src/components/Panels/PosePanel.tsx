import { useEffect, useRef, useState } from 'react'
import { useCharacterStore } from '../../store/useCharacterStore'
import { PRESET_POSES } from '../../data/presetPoses'
import { renderPoseThumbnail } from '../../three/thumbnailRenderer'
import { transitionToPose } from '../../pose/poseTransition'
import type { PoseData, SavedPose } from '../../types/character'

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function PosePanel() {
  const proportions = useCharacterStore((s) => s.proportions)
  const pose = useCharacterStore((s) => s.pose)
  const expression = useCharacterStore((s) => s.expression)
  const savedPoses = useCharacterStore((s) => s.savedPoses)
  const addSavedPose = useCharacterStore((s) => s.addSavedPose)
  const removeSavedPose = useCharacterStore((s) => s.removeSavedPose)
  const commitHistory = useCharacterStore((s) => s.commitHistory)
  const setPose = useCharacterStore((s) => s.setPose)
  const setExpression = useCharacterStore((s) => s.setExpression)

  const [presetThumbs, setPresetThumbs] = useState<Record<string, string>>({})
  const [saveName, setSaveName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const thumbs: Record<string, string> = {}
      for (const preset of PRESET_POSES) {
        thumbs[preset.id] = renderPoseThumbnail(proportions, preset.pose, 110)
      }
      setPresetThumbs(thumbs)
    }, 350)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(proportions)])

  const applyPose = (target: PoseData) => {
    commitHistory(pose)
    transitionToPose(target)
  }

  const handleSave = () => {
    const name = saveName.trim() || `내 포즈 ${savedPoses.length + 1}`
    const thumbnail = renderPoseThumbnail(proportions, pose, 110)
    const saved: SavedPose = {
      id: `saved-${Date.now()}`,
      name,
      thumbnail,
      pose,
      expression,
      createdAt: Date.now(),
    }
    addSavedPose(saved)
    setSaveName('')
  }

  const handleExport = () => {
    const data = { proportions, pose, expression, exportedAt: new Date().toISOString() }
    download(`pose-${Date.now()}.json`, JSON.stringify(data, null, 2), 'application/json')
  }

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (data.pose) {
        commitHistory(pose)
        setPose(data.pose)
      }
      if (data.expression) setExpression(data.expression)
    } catch {
      window.alert('포즈 파일을 읽을 수 없습니다.')
    }
  }

  return (
    <div className="panel-card">
      <h2 className="panel-title">포즈 라이브러리</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {PRESET_POSES.map((p) => (
          <button
            key={p.id}
            className="flex flex-col items-center gap-1 rounded-xl border p-1 hover:border-[var(--accent-soft)]"
            style={{ borderColor: 'var(--card-border)' }}
            onClick={() => applyPose(p.pose)}
            title={p.name}
          >
            {presetThumbs[p.id] ? (
              <img src={presetThumbs[p.id]} alt={p.name} className="w-full aspect-square rounded-lg bg-[var(--cream)]" />
            ) : (
              <div className="w-full aspect-square rounded-lg bg-[var(--cream)]" />
            )}
            <span className="text-[11px] leading-tight text-center">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-1 mb-2">
        <input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="포즈 이름"
          className="flex-1 min-w-0 rounded-lg border px-2 py-1 text-sm"
          style={{ borderColor: 'var(--card-border)' }}
        />
        <button className="icon-toggle" onClick={handleSave}>
          현재 포즈 저장
        </button>
      </div>

      {savedPoses.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {savedPoses.map((sp) => (
            <div
              key={sp.id}
              className="relative flex flex-col items-center gap-1 rounded-xl border p-1"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <button className="w-full" onClick={() => applyPose(sp.pose)} title={sp.name}>
                {sp.thumbnail && (
                  <img src={sp.thumbnail} alt={sp.name} className="w-full aspect-square rounded-lg bg-[var(--cream)]" />
                )}
                <span className="text-[11px] leading-tight text-center block truncate">{sp.name}</span>
              </button>
              <button
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] leading-none"
                onClick={() => removeSavedPose(sp.id)}
                title="삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1">
        <button className="icon-toggle flex-1" onClick={handleExport}>
          JSON 내보내기
        </button>
        <button className="icon-toggle flex-1" onClick={() => fileInputRef.current?.click()}>
          JSON 불러오기
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
