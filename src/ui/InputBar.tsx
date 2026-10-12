import { useEffect, useRef, useState } from 'react'

const MAX_HEIGHT_PX = 72

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  return (ctor as (new () => SpeechRecognitionLike) | undefined) ?? null
}

interface InputBarProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState('')
  const [listening, setListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const RecognitionCtor = useRef(getSpeechRecognitionCtor())
  const micSupported = Boolean(RecognitionCtor.current)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`
  }, [value])

  function handleSend() {
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function toggleMic() {
    const Ctor = RecognitionCtor.current
    if (!Ctor) return
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      setValue((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript))
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/80 p-2.5 shadow-lg shadow-black/30 backdrop-blur">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
        aria-label="Ask Company Brain a question"
        placeholder={disabled ? 'Company Brain is thinking…' : 'Ask Company Brain…'}
        className="focus-ring flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-5 text-slate-100 placeholder:text-slate-500 disabled:opacity-50"
        style={{ overflowY: 'auto' }}
      />
      {micSupported && (
        <button
          type="button"
          onClick={toggleMic}
          aria-label={listening ? 'Stop voice input' : 'Ask by voice'}
          title={listening ? 'Listening…' : 'Ask by voice'}
          className={`focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
            listening
              ? 'animate-pulse border-red-400/60 bg-red-500/20 text-red-300'
              : 'border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-cyan-300'
          }`}
        >
          <MicIcon />
        </button>
      )}
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Send question"
        title="Send"
        className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/90 text-slate-950 transition disabled:cursor-not-allowed disabled:bg-slate-700/60 disabled:text-slate-500"
      >
        <SendIcon />
      </button>
    </div>
  )
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0M12 19v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 12l16-7-5 16-4-7-7-2z" fill="currentColor" />
    </svg>
  )
}
