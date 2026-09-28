import { useState } from 'react'
import HeadRotationPanel from './HeadRotationPanel'
import PosePanel from './PosePanel'
import ExpressionPanel from './ExpressionPanel'

type Tab = 'pose' | 'expression'

// 오른쪽 패널을 탭으로 묶어 "포즈"/"표정"을 오갈 수 있게 한다.
// 3단 레이아웃(왼쪽/가운데/오른쪽)을 유지하면서 좁은 화면에서도 폭을 줄일 수 있다.
export default function RightPanelTabs() {
  const [tab, setTab] = useState<Tab>('pose')

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="flex gap-1 panel-card !py-2 !px-2 shrink-0">
        <button
          className={`view-btn flex-1 ${tab === 'pose' ? 'view-btn-active' : ''}`}
          onClick={() => setTab('pose')}
        >
          포즈
        </button>
        <button
          className={`view-btn flex-1 ${tab === 'expression' ? 'view-btn-active' : ''}`}
          onClick={() => setTab('expression')}
        >
          표정
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3">
        {tab === 'pose' ? (
          <>
            <HeadRotationPanel />
            <PosePanel />
          </>
        ) : (
          <ExpressionPanel />
        )}
      </div>
    </div>
  )
}
