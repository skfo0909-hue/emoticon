import BodyShapePanel from './components/Panels/BodyShapePanel'
import CameraViewToolbar from './components/Panels/CameraViewToolbar'
import RightPanelPlaceholder from './components/Panels/RightPanelPlaceholder'
import CanvasStage from './components/Scene/CanvasStage'

function App() {
  return (
    <div className="h-full w-full flex flex-col p-3 gap-3">
      <header className="flex items-center gap-2 px-1">
        <h1 className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
          이모티콘 포즈 인형
        </h1>
        <span className="text-xs opacity-60">캐릭터 포즈 참고용 3D 구체관절 인형 도구</span>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-[260px_1fr_280px] gap-3">
        <aside className="min-h-0 overflow-y-auto">
          <BodyShapePanel />
        </aside>

        <main className="min-h-0 flex flex-col gap-3">
          <CameraViewToolbar />
          <div className="flex-1 min-h-0 panel-card !p-1 overflow-hidden">
            <div className="w-full h-full rounded-2xl overflow-hidden">
              <CanvasStage />
            </div>
          </div>
        </main>

        <aside className="min-h-0 overflow-y-auto">
          <RightPanelPlaceholder />
        </aside>
      </div>
    </div>
  )
}

export default App
