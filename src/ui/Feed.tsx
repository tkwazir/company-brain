import { useEffect, useRef } from 'react'
import { useBrainStore } from '../state/store'
import type { FeedMessage, QueryStage } from '../state/store'
import { AnswerCard } from './AnswerCard'
import { setFeedAnchorEl } from '../scene/beamBridge'

const STAGE_LABEL: Record<QueryStage, string> = {
  thinking: 'Planning query…',
  routing: 'Routing to data floors…',
  governance: 'Checking access…',
  beaming: 'Compiling answer…',
  answered: '',
  cooldown: '',
}

export function Feed() {
  const feed = useBrainStore((s) => s.feed)
  const activeQuery = useBrainStore((s) => s.activeQuery)
  const anchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFeedAnchorEl(anchorRef.current)
    return () => setFeedAnchorEl(null)
  }, [])

  useEffect(() => {
    anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [feed.length])

  const showStageIndicator = activeQuery && activeQuery.stage !== 'answered' && activeQuery.stage !== 'cooldown'

  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      {feed.length === 0 && !showStageIndicator ? (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
          Ask a question below to see Company Brain route it through governed data.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feed.map((message) => (
            <FeedMessageView key={message.id} message={message} />
          ))}
          {showStageIndicator && (
            <div className="flex max-w-[90%] items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500 [animation-delay:300ms]" />
              </span>
              {STAGE_LABEL[activeQuery!.stage]}
            </div>
          )}
          <div ref={anchorRef} />
        </div>
      )}
    </div>
  )
}

function FeedMessageView({ message }: { message: FeedMessage }) {
  if (message.kind === 'question') {
    return (
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-slate-900 px-4 py-2 text-sm text-white">
        {message.text}
      </div>
    )
  }
  if (message.response) {
    return <AnswerCard response={message.response} />
  }
  return (
    <div className="max-w-[90%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
      {message.text}
    </div>
  )
}
