import { useCharacterStore } from '../../store/useCharacterStore'

const JOINT_LABELS: Record<string, string> = {
  pelvis: '골반',
  torso: '몸통',
  neck: '목',
  head: '머리',
  shoulderL: '왼쪽 어깨',
  upperArmL: '왼쪽 위팔',
  elbowL: '왼쪽 팔꿈치',
  handL: '왼쪽 손',
  shoulderR: '오른쪽 어깨',
  upperArmR: '오른쪽 위팔',
  elbowR: '오른쪽 팔꿈치',
  handR: '오른쪽 손',
  hipL: '왼쪽 엉덩이',
  kneeL: '왼쪽 무릎',
  footL: '왼쪽 발',
  hipR: '오른쪽 엉덩이',
  kneeR: '오른쪽 무릎',
  footR: '오른쪽 발',
}

export default function PoseControlToolbar() {
  const interactionMode = useCharacterStore((s) => s.interactionMode)
  const setInteractionMode = useCharacterStore((s) => s.setInteractionMode)
  const selectedJoint = useCharacterStore((s) => s.selectedJoint)
  const undo = useCharacterStore((s) => s.undo)
  const redo = useCharacterStore((s) => s.redo)
  const resetPose = useCharacterStore((s) => s.resetPose)
  const past = useCharacterStore((s) => s.past)
  const future = useCharacterStore((s) => s.future)
  const pelvisGizmoMode = useCharacterStore((s) => s.pelvisGizmoMode)
  const setPelvisGizmoMode = useCharacterStore((s) => s.setPelvisGizmoMode)
  const mirrorLeftToRight = useCharacterStore((s) => s.mirrorLeftToRight)
  const flipPoseLeftRight = useCharacterStore((s) => s.flipPoseLeftRight)

  return (
    <div className="flex flex-col gap-2 panel-card !py-2 !px-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          <button
            className={`view-btn ${interactionMode === 'fk' ? 'view-btn-active' : ''}`}
            onClick={() => setInteractionMode('fk')}
          >
            FK 모드
          </button>
          <button
            className={`view-btn ${interactionMode === 'ik' ? 'view-btn-active' : ''}`}
            onClick={() => setInteractionMode('ik')}
          >
            IK 모드
          </button>
        </div>

        <div className="text-sm px-2 min-w-[110px]">
          {selectedJoint ? (
            <span>
              선택: <b style={{ color: 'var(--accent)' }}>{JOINT_LABELS[selectedJoint] ?? selectedJoint}</b>
            </span>
          ) : (
            <span className="opacity-50">관절을 선택하세요</span>
          )}
        </div>

        {selectedJoint === 'pelvis' && (
          <div className="flex gap-1">
            <button
              className={`icon-toggle ${pelvisGizmoMode === 'translate' ? 'icon-toggle-active' : ''}`}
              onClick={() => setPelvisGizmoMode('translate')}
            >
              골반 이동
            </button>
            <button
              className={`icon-toggle ${pelvisGizmoMode === 'rotate' ? 'icon-toggle-active' : ''}`}
              onClick={() => setPelvisGizmoMode('rotate')}
            >
              골반 회전
            </button>
          </div>
        )}

        <div className="flex gap-1 ml-auto">
          <button className="icon-toggle" disabled={past.length === 0} onClick={undo} title="실행취소 (Ctrl+Z)">
            ↩ 실행취소
          </button>
          <button className="icon-toggle" disabled={future.length === 0} onClick={redo} title="다시실행 (Ctrl+Shift+Z)">
            ↪ 다시실행
          </button>
          <button className="icon-toggle" onClick={resetPose} title="포즈 초기화">
            ⟳ 포즈 초기화
          </button>
        </div>
      </div>

      <div className="flex gap-1">
        <span className="text-xs opacity-60 self-center mr-1">대칭 도구</span>
        <button className="icon-toggle" onClick={mirrorLeftToRight} title="왼쪽 포즈를 오른쪽에 복사">
          왼쪽→오른쪽 복사
        </button>
        <button className="icon-toggle" onClick={flipPoseLeftRight} title="좌우 반전">
          좌우 반전
        </button>
      </div>
    </div>
  )
}
