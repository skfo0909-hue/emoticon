// 캐릭터 메쉬에 공통으로 사용하는 재질. 렌더 모드(툰/외곽선/실루엣)에 따라
// 다르게 그려지며, 5단계에서 실루엣/외곽선 로직이 추가된다.
import { useCharacterStore } from '../../store/useCharacterStore'

export const BODY_COLOR = '#f3d9b1'
export const BODY_COLOR_SHADOW = '#e0bd8c'

export default function BodyMaterial() {
  const renderMode = useCharacterStore((s) => s.renderMode)

  if (renderMode === 'silhouette') {
    return <meshBasicMaterial color="#1f1b16" />
  }

  // toon / outline 공통 베이스 (외곽선은 별도 백페이스 메쉬로 그려짐)
  return <meshToonMaterial color={BODY_COLOR} />
}
