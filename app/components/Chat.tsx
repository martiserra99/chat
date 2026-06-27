'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const RESPONSES = [
  "I understand what you're asking. Let me think through this carefully.\n\nBased on what you've described, the most important thing to consider is the underlying structure of the problem. When we look at it from first principles, a few key patterns emerge that can guide the solution.",
  "That's an interesting question. The short answer is: it depends on context.\n\nThe longer answer involves weighing several factors — the constraints you're working within, the outcomes you're optimizing for, and the tradeoffs you're willing to accept. What matters most here is being explicit about your priorities.",
  "Let me break this down into parts.\n\nFirst, the foundational concept you need to understand is how the system behaves under normal conditions. Second, you should consider the edge cases — these are where most real-world complications arise. Finally, think about how these pieces fit together in practice.",
  "Good question. Here's how I'd approach it.\n\nStart by identifying what you already know versus what you need to find out. Then work backwards from the desired outcome. Often the path forward becomes clearer once you're specific about where you want to end up.",
  "There are a few ways to think about this.\n\nThe conventional approach works well for standard cases, but I'd argue the more interesting angle is to examine the assumptions embedded in the question itself. Sometimes the framing determines the answer before any analysis begins.",
]

let responseIndex = 0

async function fetchReply(): Promise<string> {
  await new Promise(r => setTimeout(r, 900 + Math.random() * 500))
  return RESPONSES[responseIndex++ % RESPONSES.length]
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function adjustHeight() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 176) + 'px'
  }

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || thinking) return

    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text },
    ])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setThinking(true)

    const reply = await fetchReply()
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'assistant', content: reply },
    ])
    setThinking(false)
  }, [input, thinking])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-surface">
      <header className="flex items-center gap-2.5 px-6 h-14 border-b border-chrome bg-white shrink-0">
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span className="text-sm font-medium text-ink tracking-wide">Assistant</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          {messages.length === 0 && !thinking && (
            <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
              <p className="text-sm text-muted">What would you like to know?</p>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[75%] bg-ink text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[90%] pl-4 border-l-2 border-accent">
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="pl-4 border-l-2 border-accent flex items-center gap-1.5 h-8">
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-chrome bg-white shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-end gap-2.5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                adjustHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message…"
              rows={1}
              className="flex-1 resize-none bg-surface rounded-xl border border-chrome px-4 py-3 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all leading-relaxed"
            />
            <button
              onClick={send}
              disabled={!input.trim() || thinking}
              className="shrink-0 w-10 h-10 mb-px rounded-xl bg-accent text-white flex items-center justify-center hover:bg-violet-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-muted text-center mt-2.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
