export type Flashcard = { q: string; a: string }
export type MCQ = { id: string; q: string; options: string[]; answer: number; explain?: string }
export type MCQSetMeta = { setId: string; title: string }
export type TopicMeta = {
  grade: string; subject: string; topicId: string; title: string;
  flashcardsPath?: string;       // legacy single-set path (flashcards.json)
  flashcardSets?: MCQSetMeta[];  // NEW: multi-set flashcards
  mcqSets?: MCQSetMeta[];
}
