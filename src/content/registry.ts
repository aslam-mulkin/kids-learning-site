
// Content registry using static glob maps (no dynamic import vars).
// Folder: src/content/<grade>/<subject>/<bab-x>/(flashcards.json | mcq/set-*.json | meta.json)
import type { TopicMeta } from '@/types'

// Load all JSON eagerly and take their default exports.
const flashcardFiles = import.meta.glob('./**/flashcards.json', { eager: true, import: 'default' })
const mcqFiles = import.meta.glob('./**/mcq/*.json', { eager: true, import: 'default' })
const metaFiles = import.meta.glob('./**/meta.json', { eager: true, import: 'default' })

type AnyObj = any

function parsePath(p: string) {
  // './2/bahasa-indonesia/bab-1/flashcards.json' -> grade=2, subject=bahasa-indonesia, topicId=bab-1
  const parts = p.split('/').filter(Boolean)
  const start = parts[0] === '.' ? 1 : 0
  const grade = parts[start]
  const subject = parts[start+1]
  const topicId = parts[start+2]
  return { grade, subject, topicId }
}

const flashcardsMap = new Map<string, any>()
const mcqMap = new Map<string, Record<string, any>>() // key: 'grade/subject/topic' -> { 'set-1': items, ... }
const metaMap = new Map<string, { title?: string }>()

for (const [path, data] of Object.entries(flashcardFiles as Record<string, AnyObj>)) {
  const { grade, subject, topicId } = parsePath(path)
  const key = `${grade}/${subject}/${topicId}`
  flashcardsMap.set(key, data)
}

for (const [path, data] of Object.entries(mcqFiles as Record<string, AnyObj>)) {
  const { grade, subject, topicId } = parsePath(path)
  const key = `${grade}/${subject}/${topicId}`
  const setFile = path.split('/').pop()!
  const setId = setFile.replace('.json', '')
  const bucket = mcqMap.get(key) ?? {}
  bucket[setId] = data
  mcqMap.set(key, bucket)
}

for (const [path, data] of Object.entries(metaFiles as Record<string, AnyObj>)) {
  const { grade, subject, topicId } = parsePath(path)
  const key = `${grade}/${subject}/${topicId}`
  metaMap.set(key, data as { title?: string })
}

export function listTopics(): TopicMeta[] {
  const keys = new Set<string>([...flashcardsMap.keys(), ...mcqMap.keys(), ...metaMap.keys()])
  const out: TopicMeta[] = []
  for (const key of keys) {
    const [grade, subject, topicId] = key.split('/')
    const meta = metaMap.get(key)
    const mcqBucket = mcqMap.get(key) || {}
    const mcqSets = Object.keys(mcqBucket).sort().map(s => ({ setId: s, title: s.replace('-', ' ').toUpperCase() }))
    out.push({
      grade, subject, topicId,
      title: meta?.title ?? topicId.replace('-', ' ').toUpperCase(),
      flashcardsPath: key, // logical key
      mcqSets
    })
  }
  return out.sort((a,b) => a.grade.localeCompare(b.grade) || a.subject.localeCompare(b.subject) || a.topicId.localeCompare(b.topicId))
}

export async function loadFlashcards(meta: TopicMeta) {
  const key = `${meta.grade}/${meta.subject}/${meta.topicId}`
  return flashcardsMap.get(key) ?? null
}

export async function loadMCQ(meta: TopicMeta, setId: string) {
  const key = `${meta.grade}/${meta.subject}/${meta.topicId}`
  const bucket = mcqMap.get(key) ?? {}
  return bucket[setId] ?? null
}
