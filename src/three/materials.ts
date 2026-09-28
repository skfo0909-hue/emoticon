// 캐릭터 메쉬에 사용하는 재질을 한 곳에서 관리한다.
// 라이브 R3F 렌더링과 오프스크린(썸네일/PNG 내보내기) 렌더링이 동일한 재질을
// 공유해 두 곳의 결과가 일치하도록 한다.
import { BackSide, DataTexture, MeshBasicMaterial, MeshToonMaterial, NearestFilter, RedFormat } from 'three'

export const BODY_COLOR = '#f3d9b1'
export const OUTLINE_COLOR = 0x241c14
export const SILHOUETTE_COLOR = 0x1f1b16
export const OUTLINE_SCALE = 1.055

let gradientMap: DataTexture | null = null

// 계단식(cel) 음영을 위한 작은 그라데이션 텍스처. 3단계로 끊어 툰 느낌을 낸다.
export function getToonGradientMap(): DataTexture {
  if (!gradientMap) {
    const colors = new Uint8Array([100, 170, 220, 255])
    const tex = new DataTexture(colors, colors.length, 1, RedFormat)
    tex.needsUpdate = true
    tex.magFilter = NearestFilter
    tex.minFilter = NearestFilter
    gradientMap = tex
  }
  return gradientMap
}

export function createToonMaterial(color: string | number = BODY_COLOR) {
  return new MeshToonMaterial({ color, gradientMap: getToonGradientMap() })
}

export function createOutlineMaterial() {
  return new MeshBasicMaterial({ color: OUTLINE_COLOR, side: BackSide })
}

export function createSilhouetteMaterial() {
  return new MeshBasicMaterial({ color: SILHOUETTE_COLOR })
}

// 외곽선만 모드에서, 뒷면 셸이 몸 안쪽까지 다 보이지 않도록 색은 그리지 않고
// 깊이(depth)만 기록하는 재질. 이걸 원래 크기 메쉬에 씌워 셸의 안쪽을 가려준다.
export function createDepthOnlyMaterial() {
  return new MeshBasicMaterial({ colorWrite: false })
}
