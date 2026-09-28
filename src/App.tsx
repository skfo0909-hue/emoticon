import { useEffect, useState } from 'react'
import BodyShapePanel from './components/Panels/BodyShapePanel'
import CameraViewToolbar from './components/Panels/CameraViewToolbar'
import PoseControlToolbar from './components/Panels/PoseControlToolbar'
import RenderSettingsPanel from './components/Panels/RenderSettingsPanel'
import RightPanelTabs from './components/Panels/RightPanelTabs'
import CanvasStage from './components/Scene/CanvasStage'
import { useCharacterStore } from './store/useCharacterStore'

function App() {
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key.toLowerCase() !== 'z') return
      e.preventDefault()
      const { undo, redo } = useCharacterStore.getState()
      if (e.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="h-full w-full flex flex-col p-2 sm:p-3 gap-2 sm:gap-3 overflow-hidden">
      <header className="flex items-center gap-2 px-1 shrink-0 relative z-40">
        <button
          className="icon-toggle lg:hidden"
          onClick={() => setLeftOpen((v) => !v)}
          aria-label="체형·렌더 패널 열기"
        >
          체형
        </button>
        <h1 className="text-base sm:text-lg font-bold truncate" style={{ color: 'var(--accent)' }}>
          이모티콘 포즈 인형
        </h1>
        <span className="text-xs opacity-60 hidden md:inline">캐릭터 포즈 참고용 3D 구체관절 인형 도구</span>
        <button
          className="icon-toggle lg:hidden ml-auto"
          onClick={() => setRightOpen((v) => !v)}
          aria-label="포즈·표정 패널 열기"
        >
          포즈·표정
        </button>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-3 relative">
        {/* 왼쪽: 체형/렌더 패널. 좁은 화면에서는 슬라이드 드로어로 표시 */}
        <aside
          className={`
            lg:static lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto lg:shadow-none lg:bg-transparent lg:w-auto
            fixed inset-y-0 left-0 z-30 w-[85vw] max-w-[300px] p-2 overflow-y-auto flex flex-col gap-3
            transition-transform duration-200 bg-[var(--cream)]
            ${leftOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <BodyShapePanel />
          <RenderSettingsPanel />
        </aside>
        {leftOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setLeftOpen(false)} />
        )}

        <main className="min-h-0 flex flex-col gap-3">
          <CameraViewToolbar />
          <PoseControlToolbar />
          <div className="flex-1 min-h-0 panel-card !p-1 overflow-hidden">
            <div className="w-full h-full rounded-2xl overflow-hidden">
              <CanvasStage />
            </div>
          </div>
        </main>

        {/* 오른쪽: 포즈/표정 탭 패널. 좁은 화면에서는 슬라이드 드로어로 표시 */}
        <aside
          className={`
            lg:static lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto lg:shadow-none lg:bg-transparent lg:w-auto
            fixed inset-y-0 right-0 z-30 w-[90vw] max-w-[340px] p-2 overflow-hidden flex flex-col
            transition-transform duration-200 bg-[var(--cream)]
            ${rightOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <RightPanelTabs />
        </aside>
        {rightOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setRightOpen(false)} />
        )}
      </div>
    </div>
  )
}

export default App
