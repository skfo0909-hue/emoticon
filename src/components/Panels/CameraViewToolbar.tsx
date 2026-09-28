import { useCharacterStore } from '../../store/useCharacterStore'
import type { CameraViewName } from '../../store/useCharacterStore'

const VIEWS: { key: CameraViewName; label: string }[] = [
  { key: 'front', label: '정면' },
  { key: 'threeQuarterLeft', label: '3/4 좌' },
  { key: 'threeQuarterRight', label: '3/4 우' },
  { key: 'side', label: '측면' },
  { key: 'back', label: '뒷면' },
  { key: 'top', label: '위에서' },
  { key: 'bottom', label: '아래에서' },
]

export default function CameraViewToolbar() {
  const cameraView = useCharacterStore((s) => s.cameraView)
  const setCameraView = useCharacterStore((s) => s.setCameraView)
  const fov = useCharacterStore((s) => s.fov)
  const setFov = useCharacterStore((s) => s.setFov)

  return (
    <div className="flex flex-wrap items-center gap-2 panel-card !py-2 !px-3">
      <div className="flex flex-wrap gap-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setCameraView(v.key)}
            className={`view-btn ${cameraView === v.key ? 'view-btn-active' : ''}`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 ml-auto text-sm">
        <span className="whitespace-nowrap">원근감</span>
        <input
          type="range"
          min={16}
          max={70}
          step={1}
          value={fov}
          onChange={(e) => setFov(parseFloat(e.target.value))}
          className="hand-slider w-28"
        />
      </div>
    </div>
  )
}
