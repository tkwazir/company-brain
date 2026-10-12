import { useEffect, useRef } from 'react'
import { useBrainStore } from '../state/store'
import type { FeedMessage } from '../state/store'

export function Feed() {
  const feed = useBrainStore((s) => s.feed)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [feed.length])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-800/60 bg-slate-950/50 p-4 backdrop-blur-sm">
      {feed.length === 0 ? (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
          Ask a question below to see Company Brain route it through governed data.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feed.map((message) => (
            <FeedMessageView key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}

function FeedMessageView({ message }: { message: FeedMessage }) {
  if (message.kind === 'question') {
    return (
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm border border-cyan-400/20 bg-cyan-500/15 px-4 py-2 text-sm text-slate-100">
        {message.text}
      </div>
    )
  }
  return (
    <div className="max-w-[90%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
      {message.text ?? 'Thinking…'}
    </div>
  )
}
