
import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import type { MCQ } from '@/types'

type Props = { items: MCQ[] }

export default function QuizView({ items }: Props) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(items.length).fill(-1))
  const [finished, setFinished] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)

  const allAnswered = useMemo(() => answers.every(a => a !== -1), [answers])
  const score = useMemo(
    () => answers.reduce((acc, a, i) => acc + (a === items[i].answer ? 1 : 0), 0),
    [answers, items]
  )

  function choose(o: number) {
    if (finished) return
    const copy = [...answers]; copy[idx] = o; setAnswers(copy)
  }
  function next() { if (idx < items.length-1) setIdx(idx+1) }
  function prev() { if (idx > 0) setIdx(idx-1) }
  function finish() { if (allAnswered) setFinished(true) }
  function reset() {
    setIdx(0); setAnswers(Array(items.length).fill(-1)); setFinished(false); setReviewMode(false)
  }

  if (finished && !reviewMode) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardTitle>Nilai Akhir</CardTitle>
        <CardContent className="space-y-3">
          <div className="text-lg font-semibold">Skor: {score} / {items.length}</div>
          <div className="text-sm text-slate-600">Selesaikan semua soal untuk melihat kunci jawaban.</div>
          <div className="flex gap-2">
            <Button onClick={() => setReviewMode(true)}>Lihat Kunci Jawaban</Button>
            <Button variant="outline" onClick={reset}>Ulangi</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (finished && reviewMode) {
    return (
      <div className="space-y-4">
        <Card className="max-w-xl mx-auto">
          <CardTitle>Ulasan Jawaban</CardTitle>
          <CardContent className="text-sm text-slate-600">
            Skor: {score} / {items.length}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {items.map((it, qi) => {
            const selected = answers[qi]
            return (
              <Card key={it.id} className="max-w-3xl mx-auto">
                <CardTitle className="mb-2">Soal {qi+1}</CardTitle>
                <CardContent>
                  <div className="mb-3">{it.q}</div>
                  <div className="space-y-2">
                    {it.options.map((op, i) => {
                      const correct = i === it.answer
                      const chosen = i === selected
                      const cls = correct
                        ? 'border-green-500 bg-green-50'
                        : chosen
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200'
                      return (
                        <div key={i} className={`border rounded-xl p-2 ${cls}`}>
                          {chr(i)}. {op}
                        </div>
                      )
                    })}
                  </div>
                  {it.explain && <div className="mt-3 text-sm text-slate-600">Pembahasan: {it.explain}</div>}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="max-w-3xl mx-auto flex gap-2">
          <Button variant="outline" onClick={() => setReviewMode(false)}>Kembali</Button>
          <Button onClick={reset}>Ulangi Kuis</Button>
        </div>
      </div>
    )
  }

  // Doing the quiz (no per-question check; reveal only at the end)
  const it = items[idx]
  const selected = answers[idx]

  return (
    <Card className="max-w-2xl mx-auto">
      <CardTitle className="mb-2">Soal {idx+1} / {items.length}</CardTitle>
      <CardContent>
        <div className="mb-4">{it.q}</div>
        <div className="space-y-2 mb-4">
          {it.options.map((op, i) => {
            const chosen = selected === i
            const state = chosen ? 'border-blue-500 ring-1 ring-blue-200' : 'border-slate-200'
            return (
              <div key={i} className={`border rounded-xl p-2 cursor-pointer ${state}`} onClick={() => choose(i)}>
                {chr(i)}. {op}
              </div>
            )
          })}
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={prev} disabled={idx===0}>Sebelumnya</Button>
          <Button onClick={next} disabled={idx===items.length-1}>Berikutnya</Button>
          <Button variant="outline" onClick={finish} className="ml-auto" disabled={!allAnswered}>Selesai</Button>
        </div>
        {!allAnswered && <div className="mt-3 text-xs text-slate-500">Jawab semua pertanyaan untuk menyelesaikan kuis.</div>}
      </CardContent>
    </Card>
  )
}

function chr(i: number) { return String.fromCharCode(65+i) }
