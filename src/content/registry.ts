// Content registry using static glob maps (no dynamic import vars).
// Folder: src/content/<grade>/<subject>/<bab-x>/
//   flashcards.json                # legacy single set
//   flashcards/ set-1.json ...     # multi-set flashcards
//   mcq/ set-*.json
//   meta.json
import type { TopicMeta } from '@/types'

const legacyFlashcards = import.meta.glob('./**/flashcards.json', { eager: true, import: 'default' })
const flashcardSets = import.meta.glob('./**/flashcards/*.json', { eager: true, import: 'default' })
const mcqFiles = import.meta.glob('./**/mcq/*.json', { eager: true, import: 'default' })
const metaFiles = import.meta.glob('./**/meta.json', { eager: true, import: 'default' })

function parsePath(p: string) {
  const parts = p.split('/').filter(Boolean)
  const start = parts[0] === '.' ? 1 : 0
  const grade = parts[start]
  const subject = parts[start+1]
  const topicId = parts[start+2]
  return { grade, subject, topicId }
}

const legacyFlashMap = new Map<string, any>()                 // key -> array
const flashMultiMap = new Map<string, Record<string, any>>()  // key -> { set-1: array, ... }
const mcqMap = new Map<string, Record<string, any>>()         // key -> { set-1: array, ... }
const metaMap = new Map<string, { title?: string }>()

for (const [path, data] of Object.entries(legacyFlashcards as Record<string, any>)) {
  const { grade, subject, topicId } = parsePath(path)
  const key = `${grade}/${subject}/${topicId}`
  legacyFlashMap.set(key, data)
}

for (const [path, data] of Object.entries(flashcardSets as Record<string, any>)) {
  // './2/bahasa-indonesia/bab-1/flashcards/set-1.json'
  const parts = path.split('/')
  const setFile = parts.pop()!
  const setId = setFile.replace('.json','')
  const { grade, subject, topicId } = parsePath(path)
  const key = `${grade}/${subject}/${topicId}`
  const bucket = flashMultiMap.get(key) ?? {}
  bucket[setId] = data
  flashMultiMap.set(key, bucket)
}

for (const [path, data] of Object.entries(mcqFiles as Record<string, any>)) {
  const parts = path.split('/')
  const setFile = parts.pop()!
  const setId = setFile.replace('.json','')
  const { grade, subject, topicId } = parsePath(path)
  const key = `${grade}/${subject}/${topicId}`
  const bucket = mcqMap.get(key) ?? {}
  bucket[setId] = data
  mcqMap.set(key, bucket)
}

for (const [path, data] of Object.entries(metaFiles as Record<string, any>)) {
  const { grade, subject, topicId } = parsePath(path)
  const key = `${grade}/${subject}/${topicId}`
  metaMap.set(key, data as { title?: string })
}

export function listTopics(): TopicMeta[] {
  const keys = new Set<string>([...legacyFlashMap.keys(), ...flashMultiMap.keys(), ...mcqMap.keys(), ...metaMap.keys()])
  const out: TopicMeta[] = []
  for (const key of keys) {
    const [grade, subject, topicId] = key.split('/')
    const meta = metaMap.get(key)
    const mcqBucket = mcqMap.get(key) || {}
    const mcqSets = Object.keys(mcqBucket).sort().map(s => ({ setId: s, title: s.replace('-', ' ').toUpperCase() }))

    const flashBucket = flashMultiMap.get(key) || {}
    const flashSets = Object.keys(flashBucket).sort()
    let flashcardSets = flashSets.map(s => ({ setId: s, title: s.replace('-', ' ').toUpperCase() }))

    // legacy single file -> expose as set-1
    if (!flashcardSets.length && legacyFlashMap.has(key)) {
      flashcardSets = [{ setId: 'set-1', title: 'SET 1' }]
    }

    out.push({
      grade, subject, topicId,
      title: meta?.title ?? topicId.replace('-', ' ').toUpperCase(),
      flashcardsPath: legacyFlashMap.has(key) ? key : undefined,
      flashcardSets,
      mcqSets
    })
  }
  return out.sort((a,b) => a.grade.localeCompare(b.grade) || a.subject.localeCompare(b.subject) || a.topicId.localeCompare(b.topicId))
}

export async function loadFlashcards(meta: TopicMeta, setId?: string) {
  const key = `${meta.grade}/${meta.subject}/${meta.topicId}`
  const multi = flashMultiMap.get(key)
  if (multi) {
    const sel = setId && multi[setId] ? setId : Object.keys(multi).sort()[0]
    return multi[sel] ?? null
  }
  // legacy: single flashcards.json
  if (legacyFlashMap.has(key)) return legacyFlashMap.get(key)
  return null
}

export async function loadMCQ(meta: TopicMeta, setId: string) {
  const key = `${meta.grade}/${meta.subject}/${meta.topicId}`
  const bucket = mcqMap.get(key) ?? {}
  return bucket[setId] ?? null
}
