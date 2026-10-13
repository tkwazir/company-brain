import { useBrainStore } from '../state/store'

// These exact strings are matched by the scripted mock responses in
// src/api/mockClient.ts (step 3) so the chips always hit a handcrafted answer.
export const SUGGESTED_QUESTIONS = [
  'What was revenue by region last quarter?',
  'Which customers churned in September and what was their lifetime value?',
  'Show average salary by department.',
  'Top 5 products by margin this year',
]

interface SuggestedQuestionsProps {
  onSelect: (text: string) => void
  disabled?: boolean
}

export function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  const hasAsked = useBrainStore((s) => s.feed.length > 0)
  if (hasAsked) return null

  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_QUESTIONS.map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="focus-ring rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-700 disabled:opacity-50"
        >
          {question}
        </button>
      ))}
    </div>
  )
}
