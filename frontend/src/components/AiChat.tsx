import { useEffect, useRef, useState } from 'react'
import RemixIcon from './RemixIcon'

/* ── Types ──────────────────────────────────────────────────────────── */
interface Message {
  role: 'ai' | 'user'
  text: string
}

/* ── Quick-action chips ─────────────────────────────────────────────── */
const CHIPS = ['Spending this month', 'Estimate my tax', 'Pending consents']

/* ── Idle nudge messages (cycle at intervals) ───────────────────────── */
const NUDGES = [
  "I'm here if you need anything 👋",
  'Ask me about your finances or identity',
  'Want a summary of this month?',
]

/* ── Colours ────────────────────────────────────────────────────────── */
const PURPLE = '#9b00d9'
const PURPLE_DARK = '#7B00B0'

/* ── Small avatar used in chat bubbles ──────────────────────────────── */
function BotAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        background: PURPLE,
        border: `2px solid ${PURPLE_DARK}`,
      }}
    >
      <img src="/logo.png" alt="FOID AI" style={{ width: size * 0.55, height: size * 0.55, objectFit: 'contain' }} />
    </div>
  )
}

/* ── FAB button ─────────────────────────────────────────────────────── */
function FabButton({ onClick, nudge }: { onClick: () => void; nudge: string | null }) {
  return (
    <div className="flex flex-col items-end gap-2">
      {/* nudge pill */}
      {nudge && (
        <div
          className="text-[12px] font-medium px-3 py-1.5 rounded-full shadow-md max-w-[200px] text-center leading-snug"
          style={{ background: '#fff', color: '#18181b', border: '1px solid #e4e4e7' }}
        >
          {nudge}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={onClick}
        aria-label="Open AI assistant"
        className="rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          width: 60, height: 60,
          background: PURPLE,
          border: `3px solid rgba(155,0,217,0.35)`,
          outline: `4px solid rgba(155,0,217,0.18)`,
        }}
      >
        <img src="/logo-white.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
      </button>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function AiChat() {
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [nudge, setNudge]     = useState<string | null>(null)
  const [nudgeIdx, setNudgeIdx] = useState(0)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "Hi Daniel — need a quick number, or want me to take you somewhere in the dashboard? I can also categorise a receipt if you snap one.",
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  /* Nudge interval — show a message every 20 s while closed */
  useEffect(() => {
    if (open) { setNudge(null); return }
    const id = setInterval(() => {
      setNudge(NUDGES[nudgeIdx % NUDGES.length])
      setNudgeIdx(i => i + 1)
      /* auto-hide after 4 s */
      setTimeout(() => setNudge(null), 4000)
    }, 20_000)
    /* show first nudge after 5 s on mount */
    const first = setTimeout(() => {
      setNudge(NUDGES[0])
      setTimeout(() => setNudge(null), 4000)
    }, 5000)
    return () => { clearInterval(id); clearTimeout(first) }
  }, [open, nudgeIdx])

  /* Scroll to bottom whenever messages change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  /* Focus input when opened */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  function send(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    const aiReply: Message = {
      role: 'ai',
      text: `You asked: "${text.trim()}". I'm working on a full answer — this is a demo build, so responses are mocked for now.`,
    }
    setMessages(prev => [...prev, userMsg, aiReply])
    setInput('')
  }

  return (
    /* Fixed container — bottom-right corner, above everything */
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat panel ── */}
      {open && (
        <div
          className="flex flex-col rounded-3xl overflow-hidden shadow-2xl"
          style={{
            width: 380,
            maxHeight: '82vh',
            background: '#fff',
            border: '1px solid #e4e4e7',
          }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between px-5 py-4"
            style={{ background: PURPLE }}
          >
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="FOID" style={{ width: 28, height: 28, objectFit: 'contain' }} />
              <div>
                <div className="text-white font-extrabold text-[17px] leading-tight"
                  style={{ fontFamily: "'Neue Machina', sans-serif" }}>
                  Foid
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                  <span className="text-[12px] font-semibold text-green-300">Online · AI credits active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <RemixIcon name="ri-close-line" size={18} color="#fff" clickable />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4" style={{ minHeight: 260, maxHeight: 360 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'ai' && <BotAvatar size={32} />}
                <div
                  className="rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed max-w-[80%]"
                  style={
                    m.role === 'ai'
                      ? { background: '#f0f0f0', color: '#3a3a3a', borderBottomLeftRadius: 4 }
                      : { background: PURPLE, color: '#fff', borderBottomRightRadius: 4 }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="flex gap-2 px-4 pb-3 flex-wrap border-t border-neutral-100 pt-3">
            {CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => send(chip)}
                className="text-[12px] font-semibold px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="px-4 pb-4">
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-full"
              style={{ background: '#f4f4f5', border: '1px solid #e4e4e7' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Ask about your finances, identity and credit score"
                className="flex-1 bg-transparent text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
              />
              <button
                onClick={() => send(input)}
                aria-label="Send"
                className="shrink-0 transition-opacity"
                style={{ opacity: input.trim() ? 1 : 0.35 }}
              >
                <RemixIcon name="ri-send-plane-fill" size={20} color={PURPLE} clickable />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      <FabButton onClick={() => setOpen(o => !o)} nudge={open ? null : nudge} />
    </div>
  )
}
