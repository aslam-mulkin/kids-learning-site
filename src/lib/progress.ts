export type QuizProgress = {
  bestScore: number
  lastScore: number
  attempts: number
  completed: boolean
  total: number
  lastPlayed?: string
}

const KEY = 'belajar-seru-progress-v1'

function safeParse(raw: string | null): Record<string, QuizProgress> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as Record<string, QuizProgress>
  } catch (e) {
    console.warn('progress parse failed', e)
  }
  return {}
}

function readStore(): Record<string, QuizProgress> {
  if (typeof window === 'undefined') return {}
  return safeParse(localStorage.getItem(KEY))
}

function writeStore(map: Record<string, QuizProgress>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(map))
}

function key(topicKey: string, setId: string) {
  return `quiz:${topicKey}:${setId}`
}

export function getQuizProgress(topicKey: string, setId: string): QuizProgress | null {
  if (!topicKey || !setId) return null
  const store = readStore()
  return store[key(topicKey, setId)] ?? null
}

export function recordQuizAttempt(topicKey: string, setId: string, score: number, total: number) {
  if (!topicKey || !setId) return null
  const store = readStore()
  const k = key(topicKey, setId)
  const prev = store[k]
  const entry: QuizProgress = {
    total,
    lastScore: score,
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    attempts: (prev?.attempts ?? 0) + 1,
    completed: score === total,
    lastPlayed: new Date().toISOString()
  }
  store[k] = entry
  writeStore(store)
  return entry
}
