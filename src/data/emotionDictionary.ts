// 로컬 감정 사전. 입력한 낱말을 동의어/부분일치로 20종 감정에 매칭한다.
import type { EyeShape, ExpressionState, FaceSymbol, MouthShape, PoseData } from '../types/character'
import { PRESET_POSES, buildPose } from './presetPoses'

export interface EmotionExpressionSpec {
  eyeShape: EyeShape
  eyeSize?: number
  eyeStretchY?: number
  eyeLookY?: number
  eyebrowVisible?: boolean
  eyebrowAngle?: number
  eyebrowHeight?: number
  mouthShape: MouthShape
  mouthSize?: number
  mouthOpenness?: number
  blushIntensity?: number
  symbols?: { kind: FaceSymbol['kind']; position: FaceSymbol['position']; scale?: number }[]
}

export interface EmotionEntry {
  id: string
  name: string
  synonyms: string[]
  expression: EmotionExpressionSpec
  poseId?: string
  customPose?: PoseData
}

function findPresetPose(id: string): PoseData | undefined {
  return PRESET_POSES.find((p) => p.id === id)?.pose
}

// 몇몇 감정 전용 포즈 (라이브러리 프리셋에 없는 경우)
const coverFacePose = buildPose({
  upperArmL: [-140, 0, -35],
  elbowL: [95, 0, 0],
  handL: [0, 0, -10],
  upperArmR: [-140, 0, 35],
  elbowR: [95, 0, 0],
  handR: [0, 0, 10],
  head: [10, 0, 0],
})

const angryStompPose = buildPose({
  torso: [-6, 0, 8],
  upperArmL: [20, 0, -20],
  elbowL: [110, 0, 0],
  upperArmR: [20, 0, 20],
  elbowR: [110, 0, 0],
  hipR: [-35, 0, 0],
  kneeR: [55, 0, 0],
  footR: [20, 0, 0],
})

export const EMOTION_DICTIONARY: EmotionEntry[] = [
  {
    id: 'joy',
    name: '기쁨',
    synonyms: ['기쁘다', '좋아', '행복', '즐거움', '즐겁다', 'happy'],
    expression: {
      eyeShape: 'smile',
      mouthShape: 'bigSmile',
      mouthOpenness: 0.6,
      blushIntensity: 0.5,
      symbols: [{ kind: 'sparkle', position: 'topRight', scale: 1 }],
    },
    poseId: 'wave',
  },
  {
    id: 'excited',
    name: '신남',
    synonyms: ['신나', '들뜸', '야호', '최고', '신난다', '흥분'],
    expression: {
      eyeShape: 'star',
      mouthShape: 'bigSmile',
      mouthOpenness: 0.8,
      blushIntensity: 0.4,
      symbols: [
        { kind: 'sparkle', position: 'topLeft', scale: 1 },
        { kind: 'sparkle', position: 'topRight', scale: 0.8 },
      ],
    },
    poseId: 'cheer',
  },
  {
    id: 'love',
    name: '사랑',
    synonyms: ['사랑해', '애정', '좋아해', '설레', 'love'],
    expression: {
      eyeShape: 'heart',
      mouthShape: 'smallSmile',
      mouthOpenness: 0.4,
      blushIntensity: 0.85,
      symbols: [{ kind: 'heartMulti', position: 'top', scale: 1.1 }],
    },
    poseId: 'heart',
  },
  {
    id: 'proud',
    name: '뿌듯',
    synonyms: ['뿌듯하다', '자랑스러움', '으쓱'],
    expression: {
      eyeShape: 'closed',
      mouthShape: 'bigSmile',
      mouthOpenness: 0.5,
      blushIntensity: 0.3,
      symbols: [{ kind: 'sparkle', position: 'top', scale: 0.8 }],
    },
    poseId: 'cheer',
  },
  {
    id: 'flutter',
    name: '설렘',
    synonyms: ['두근', '설레임', '두근두근'],
    expression: {
      eyeShape: 'circle',
      eyeSize: 1.15,
      mouthShape: 'smallSmile',
      mouthOpenness: 0.4,
      blushIntensity: 0.7,
      symbols: [{ kind: 'heart', position: 'topRight', scale: 0.8 }],
    },
    poseId: 'wave',
  },
  {
    id: 'sad',
    name: '슬픔',
    synonyms: ['슬프다', '눈물', '우울', '속상'],
    expression: {
      eyeShape: 'sad',
      eyebrowVisible: true,
      eyebrowAngle: -18,
      mouthShape: 'wave',
      mouthOpenness: 0.3,
      symbols: [{ kind: 'tear', position: 'left', scale: 0.9 }],
    },
    poseId: 'despair',
  },
  {
    id: 'upset',
    name: '서운함',
    synonyms: ['서운하다', '섭섭', '아쉬움'],
    expression: {
      eyeShape: 'sad',
      eyebrowVisible: true,
      eyebrowAngle: -12,
      mouthShape: 'wave',
      mouthOpenness: 0.2,
      symbols: [{ kind: 'gloom', position: 'top', scale: 0.9 }],
    },
    poseId: 'idle',
  },
  {
    id: 'angry',
    name: '화남',
    synonyms: ['화나', '짜증나', '빡침', '분노', 'angry'],
    expression: {
      eyeShape: 'x',
      eyebrowVisible: true,
      eyebrowAngle: 26,
      mouthShape: 'siot',
      mouthOpenness: 0.5,
      symbols: [{ kind: 'angerMark', position: 'topRight', scale: 1 }],
    },
    customPose: angryStompPose,
  },
  {
    id: 'sulky',
    name: '삐짐',
    synonyms: ['삐지다', '토라짐', '삐돌이'],
    expression: {
      eyeShape: 'closed',
      eyebrowVisible: true,
      eyebrowAngle: 14,
      mouthShape: 'pout',
      mouthOpenness: 0.3,
      symbols: [{ kind: 'angerMark', position: 'top', scale: 0.6 }],
    },
    poseId: 'idle',
  },
  {
    id: 'flustered',
    name: '당황',
    synonyms: ['당황스럽', '멘붕', '어쩌지'],
    expression: {
      eyeShape: 'dot',
      eyeSize: 0.85,
      mouthShape: 'wave',
      mouthOpenness: 0.4,
      symbols: [{ kind: 'sweat', position: 'right', scale: 1 }],
    },
    poseId: 'idle',
  },
  {
    id: 'surprised',
    name: '놀람',
    synonyms: ['놀라다', '깜짝', '헉'],
    expression: {
      eyeShape: 'circle',
      eyeSize: 1.3,
      mouthShape: 'o',
      mouthOpenness: 0.85,
      symbols: [{ kind: 'exclaim', position: 'top', scale: 1 }],
    },
    poseId: 'idle',
  },
  {
    id: 'shy',
    name: '부끄러움',
    synonyms: ['부끄럽다', '수줍음', '쑥스러움'],
    expression: {
      eyeShape: 'closed',
      mouthShape: 'smallSmile',
      mouthOpenness: 0.2,
      blushIntensity: 1,
      symbols: [{ kind: 'sweat', position: 'right', scale: 0.7 }],
    },
    customPose: coverFacePose,
  },
  {
    id: 'tired',
    name: '피곤',
    synonyms: ['피곤하다', '지침', '힘듦'],
    expression: {
      eyeShape: 'closed',
      eyebrowVisible: true,
      eyebrowAngle: -8,
      mouthShape: 'wave',
      mouthOpenness: 0.2,
      symbols: [{ kind: 'gloom', position: 'top', scale: 0.8 }],
    },
    poseId: 'sit',
  },
  {
    id: 'sleepy',
    name: '졸림',
    synonyms: ['졸리다', '잠와', '수면'],
    expression: {
      eyeShape: 'closed',
      mouthShape: 'o',
      mouthOpenness: 0.3,
      symbols: [{ kind: 'zzz', position: 'topRight', scale: 1 }],
    },
    poseId: 'lie',
  },
  {
    id: 'blank',
    name: '멍함',
    synonyms: ['멍하다', '넋나감', '얼빠짐'],
    expression: {
      eyeShape: 'dot',
      eyeSize: 0.8,
      mouthShape: 'o',
      mouthOpenness: 0.15,
      symbols: [{ kind: 'question', position: 'top', scale: 0.7 }],
    },
    poseId: 'idle',
  },
  {
    id: 'despair',
    name: '좌절',
    synonyms: ['좌절하다', '망함', '절망'],
    expression: {
      eyeShape: 'spiral',
      mouthShape: 'wave',
      mouthOpenness: 0.3,
      symbols: [{ kind: 'gloom', position: 'top', scale: 1 }],
    },
    poseId: 'despair',
  },
  {
    id: 'touched',
    name: '감동',
    synonyms: ['감동적', '뭉클', '울컥'],
    expression: {
      eyeShape: 'sad',
      mouthShape: 'smallSmile',
      mouthOpenness: 0.4,
      blushIntensity: 0.3,
      symbols: [{ kind: 'heart', position: 'top', scale: 0.8 }],
    },
    poseId: 'heart',
  },
  {
    id: 'curious',
    name: '궁금함',
    synonyms: ['궁금하다', '뭐지', '호기심'],
    expression: {
      eyeShape: 'circle',
      eyeSize: 1.05,
      mouthShape: 'siot',
      mouthOpenness: 0.3,
      symbols: [{ kind: 'question', position: 'topRight', scale: 1 }],
    },
    poseId: 'idle',
  },
  {
    id: 'annoyed',
    name: '짜증',
    synonyms: ['짜증나다', '귀찮', '싫증'],
    expression: {
      eyeShape: 'closed',
      eyebrowVisible: true,
      eyebrowAngle: 20,
      mouthShape: 'siot',
      mouthOpenness: 0.3,
      symbols: [{ kind: 'angerMark', position: 'topRight', scale: 0.7 }],
    },
    poseId: 'idle',
  },
  {
    id: 'scared',
    name: '무서움',
    synonyms: ['무섭다', '겁남', '두려움'],
    expression: {
      eyeShape: 'dot',
      eyeSize: 0.75,
      eyebrowVisible: true,
      eyebrowAngle: -20,
      mouthShape: 'wave',
      mouthOpenness: 0.3,
      symbols: [
        { kind: 'sweat', position: 'right', scale: 0.9 },
        { kind: 'shake', position: 'left', scale: 0.8 },
      ],
    },
    poseId: 'idle',
  },
]

export function getEmotionPose(entry: EmotionEntry): PoseData | null {
  if (entry.customPose) return entry.customPose
  if (entry.poseId) return findPresetPose(entry.poseId) ?? null
  return null
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '')
}

export interface EmotionMatch {
  entry: EmotionEntry
  score: number
}

// 입력어를 동의어/이름과 비교해 가장 가까운 감정을 찾는다.
// 완전 일치 > 포함 관계 > 부분 문자열 순으로 점수를 매긴다.
export function matchEmotion(input: string): EmotionMatch[] {
  const q = normalize(input)
  if (!q) return []
  const scored: EmotionMatch[] = []

  for (const entry of EMOTION_DICTIONARY) {
    const candidates = [entry.name, ...entry.synonyms].map(normalize)
    let best = 0
    for (const c of candidates) {
      if (c === q) best = Math.max(best, 100)
      else if (c.includes(q) || q.includes(c)) best = Math.max(best, 70)
      else if (levenshteinClose(c, q)) best = Math.max(best, 40)
    }
    if (best > 0) scored.push({ entry, score: best })
  }

  return scored.sort((a, b) => b.score - a.score)
}

// 아주 단순한 근접 비교(오타 1~2글자 허용)로, 사전에 없는 표현도 후보로 제안될 수 있게 한다.
function levenshteinClose(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 2) return false
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length] <= 2
}

export function resolveEmotion(input: string): { matched: EmotionEntry | null; suggestions: EmotionEntry[] } {
  const matches = matchEmotion(input)
  if (matches.length === 0) return { matched: null, suggestions: [] }
  if (matches[0].score >= 70) return { matched: matches[0].entry, suggestions: [] }
  return { matched: null, suggestions: matches.slice(0, 3).map((m) => m.entry) }
}

export function buildExpressionFromSpec(spec: EmotionExpressionSpec, base: ExpressionState): ExpressionState {
  return {
    eyes: {
      shape: spec.eyeShape,
      size: spec.eyeSize ?? 1,
      stretchY: spec.eyeStretchY ?? 1,
      spacing: base.eyes.spacing,
      lookX: 0,
      lookY: spec.eyeLookY ?? 0,
    },
    eyebrow: {
      visible: spec.eyebrowVisible ?? false,
      angle: spec.eyebrowAngle ?? 0,
      height: spec.eyebrowHeight ?? 0,
    },
    mouth: {
      shape: spec.mouthShape,
      size: spec.mouthSize ?? 1,
      openness: spec.mouthOpenness ?? 0.4,
    },
    blush: {
      size: 1,
      intensity: spec.blushIntensity ?? 0,
    },
    symbols: (spec.symbols ?? []).map((s, i) => ({
      id: `emo-${i}-${s.kind}`,
      kind: s.kind,
      position: s.position,
      scale: s.scale ?? 1,
    })),
  }
}
