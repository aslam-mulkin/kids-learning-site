
import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import type { Flashcard } from '@/types'

type Props = { cards: Flashcard[] }

// Queue-based active recall: wrong answers are re-queued at random positions
export default function FlashcardsView({ cards }: Props) {
  const initial = useMemo(() => cards.map((c, i) => ({...c, id:i})), [cards])
  const [queue, setQueue] = useState(initial)
  const [idx, setIdx] = useState(0)
  const [showAns, setShowAns] = useState(false)
  const [done, setDone] = useState(false)
  const current = queue[idx]

  function mark(correct: boolean) {
    setShowAns(false)
    const nextIdx = idx + 1
    if (!correct) {
      // re-insert the current card at a random future position
      const copy = [...queue]
      copy.splice(idx,1) // remove current
      let pos = Math.floor(Math.random() * (copy.length - idx + 1)) + idx // between idx..end
      copy.splice(pos, 0, current)
      setQueue(copy)
      // stay at same idx to show next item (which is the one that moved to idx)
      if (nextIdx >= copy.length) {
        setDone(true)
      } else {
        setIdx(idx)
      }
    } else {
      if (nextIdx >= queue.length) {
        setDone(true)
      } else {
        setIdx(nextIdx)
      }
    }
  }

  function reset() {
    setQueue(initial)
    setIdx(0)
    setShowAns(false)
    setDone(false)
  }

  if (done) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardTitle>Selesai!</CardTitle>
        <CardContent className="space-x-2">
          <Button onClick={reset}>Ulangi</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardTitle className="mb-2">Flashcard</CardTitle>
      <CardContent>
        <div className="text-sm text-slate-500 mb-2">Kartu {idx+1} dari {queue.length}</div>
        <div className="rounded-xl bg-slate-100 p-4 cursor-pointer mb-4" onClick={() => setShowAns(s=>!s)}>
          <div className="font-semibold">Q: {current.q}</div>
          {showAns && <div className="mt-2">A: {current.a}</div>}
          {!showAns && <div className="mt-2 text-slate-400 italic">Klik untuk melihat jawaban</div>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => mark(false)}>Salah (muncul lagi)</Button>
          <Button onClick={() => mark(true)}>Benar</Button>
        </div>
      </CardContent>
    </Card>
  )
}
