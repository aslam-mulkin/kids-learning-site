import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { listTopics, loadFlashcards, loadMCQ } from '@/content/registry'
import type { TopicMeta, Flashcard, MCQ } from '@/types'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getQuizProgress } from '@/lib/progress'

const FlashcardsView = React.lazy(() => import('./views/FlashcardsView'))
const QuizView = React.lazy(() => import('./views/QuizView'))

type Mode = 'flashcards' | 'quiz'

export default function App() {
  const topics = useMemo(() => listTopics(), [])
  const grades = Array.from(new Set(topics.map(t => t.grade)))

  function parseHashGrade() {
    const hash = window.location.hash.replace('#','')
    if (hash.startsWith('kelas-')) {
      const g = hash.replace('kelas-','')
      return grades.includes(g) ? g : null
    }
    return null
  }

  const [grade, setGrade] = useState(() => parseHashGrade() ?? grades[0])

  const subjects = Array.from(new Set(topics.filter(t => t.grade === grade).map(t => t.subject)))
  const [subject, setSubject] = useState(subjects[0])

  const topicOptions = topics.filter(t => t.grade === grade && t.subject === subject)
  const [topicId, setTopicId] = useState(topicOptions[0]?.topicId)

  const [mode, setMode] = useState<Mode>('flashcards')
  const [, setProgressTick] = useState(0) // bump to refresh labels after attempting a quiz

  // Multi-set selectors
  const [flashSetId, setFlashSetId] = useState<string | undefined>(topicOptions[0]?.flashcardSets?.[0]?.setId)
  const [setId, setSetId] = useState<string | undefined>(topicOptions[0]?.mcqSets?.[0]?.setId)

  // When grade changes, pick the first subject of that grade
  useEffect(() => {
    setSubject(subjects[0])
  }, [grade]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync hash with selected grade
  useEffect(() => {
    if (grade) window.location.hash = `kelas-${grade}`
  }, [grade])

  // When grade OR subject changes, pick the first topic & reset both set pickers
  useEffect(() => {
    const opts = topics.filter(t => t.grade === grade && t.subject === subject)
    setTopicId(opts[0]?.topicId)
    setSetId(opts[0]?.mcqSets?.[0]?.setId)
    setFlashSetId(opts[0]?.flashcardSets?.[0]?.setId)
  }, [grade, subject, topics])

  // Also reset set pickers when topic changes directly (user selects another bab)
  useEffect(() => {
    const cur = topics.find(t => t.grade === grade && t.subject === subject && t.topicId === topicId)
    setSetId(cur?.mcqSets?.[0]?.setId)
    setFlashSetId(cur?.flashcardSets?.[0]?.setId)
  }, [topicId, grade, subject, topics])

  const current: TopicMeta | undefined = topics.find(t => t.grade === grade && t.subject === subject && t.topicId === topicId)
  const topicKey = current ? `${current.grade}/${current.subject}/${current.topicId}` : ''

  const [cards, setCards] = useState<Flashcard[] | null>(null)
  const [mcq, setMcq] = useState<MCQ[] | null>(null)

  async function load() {
    if (!current) return
    if (mode === 'flashcards') {
      const data = await loadFlashcards(current, flashSetId)
      setCards(data)
      setMcq(null)
    } else if (mode === 'quiz' && current.mcqSets?.length && setId) {
      const data = await loadMCQ(current, setId)
      setMcq(data)
      setCards(null)
    }
  }

  // ✅ Watch the raw selectors so content refreshes immediately
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, subject, topicId, mode, setId, flashSetId])

  return (
    <div className="max-w-5xl mx-auto p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Belajar Seru</h1>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {grades.map(g => (
          <a
            key={g}
            href={`#kelas-${g}`}
            onClick={e => { e.preventDefault(); setGrade(g) }}
            className={`px-3 py-1 rounded-full border text-sm ${g === grade ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-700 hover:border-blue-400'}`}
          >
            Kelas {g}
          </a>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="grid md:grid-cols-5 gap-2">
          <div>
            <label className="text-xs text-slate-600">Kelas</label>
            <select className="w-full border rounded-xl p-2" value={grade} onChange={e => setGrade(e.target.value)}>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600">Mata Pelajaran</label>
            <select className="w-full border rounded-xl p-2" value={subject} onChange={e => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-600">Bab/Topik</label>
            <select className="w-full border rounded-xl p-2" value={topicId} onChange={e => setTopicId(e.target.value)}>
              {topicOptions.map(t => <option key={t.topicId} value={t.topicId}>{t.title}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600">Mode</label>
            <div className="flex gap-2">
              <Button variant={mode === 'flashcards' ? 'default' : 'outline'} onClick={() => setMode('flashcards')}>Flashcards</Button>
              <Button variant={mode === 'quiz' ? 'default' : 'outline'} onClick={() => setMode('quiz')}>Kuis</Button>
            </div>
          </div>

          {mode === 'flashcards' && current?.flashcardSets?.length ? (
            <div className="md:col-span-5">
              <label className="text-xs text-slate-600">Pilih Set Flashcards</label>
              <select
                className="w-full border rounded-xl p-2"
                value={flashSetId}
                onChange={e => setFlashSetId(e.target.value)}
              >
                {current.flashcardSets.map(s => <option key={s.setId} value={s.setId}>{s.title}</option>)}
              </select>
            </div>
          ) : null}

          {mode === 'quiz' && current?.mcqSets?.length ? (
            <div className="md:col-span-5">
              <label className="text-xs text-slate-600">Pilih Set Soal</label>
              <select
                className="w-full border rounded-xl p-2"
                value={setId}
                onChange={e => setSetId(e.target.value)}
              >
                {current.mcqSets.map(s => {
                  const progress = topicKey ? getQuizProgress(topicKey, s.setId) : null
                  const badge = progress
                    ? ` (terbaik ${progress.bestScore}/${progress.total}${progress.completed ? ' ✅' : ''})`
                    : ''
                  return <option key={s.setId} value={s.setId}>{s.title}{badge}</option>
                })}
              </select>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <main className="mt-4">
        <Suspense fallback={<p className="text-slate-500">Memuat…</p>}>
          {mode==='flashcards' && cards && (
            <FlashcardsView
              key={`fc-${grade}-${subject}-${topicId}-${flashSetId}-${cards.length}`}
              cards={cards}
            />
          )}
          {mode==='quiz' && mcq && (
            <QuizView
            key={`mcq-${grade}-${subject}-${topicId}-${setId}-${mcq.length}`}
            items={mcq}
            topicKey={topicKey}
            setId={setId!}
            onProgress={() => setProgressTick(x => x+1)}
            />
          )}
        </Suspense>

        {!cards && mode === 'flashcards' && <p className="text-slate-500">Tidak ada flashcards untuk topik ini.</p>}
        {!mcq && mode === 'quiz' && <p className="text-slate-500">Tidak ada set soal untuk topik ini.</p>}
      </main>

      <footer className="mt-10 text-xs text-slate-500">
        Struktur konten: <code>src/content/&lt;kelas&gt;/&lt;mapel&gt;/&lt;bab-x&gt;/(flashcards(/set-*.json)|mcq/set-*.json)</code>
      </footer>
    </div>
  )
}

function humanize(s: string) {
  return s.split('-').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
}
