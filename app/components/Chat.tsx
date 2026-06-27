"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const RESPONSES = [
  "I understand what you're asking. Let me think through this carefully.\n\nBased on what you've described, the most important thing to consider is the underlying structure of the problem. When we look at it from first principles, a few key patterns emerge that can guide the solution.",
  "That's an interesting question. The short answer is: it depends on context.\n\nThe longer answer involves weighing several factors — the constraints you're working within, the outcomes you're optimizing for, and the tradeoffs you're willing to accept. What matters most here is being explicit about your priorities.",
  "Let me break this down into parts.\n\nFirst, the foundational concept you need to understand is how the system behaves under normal conditions. Second, you should consider the edge cases — these are where most real-world complications arise. Finally, think about how these pieces fit together in practice.",
  "Good question. Here's how I'd approach it.\n\nStart by identifying what you already know versus what you need to find out. Then work backwards from the desired outcome. Often the path forward becomes clearer once you're specific about where you want to end up.",
  "There are a few ways to think about this.\n\nThe conventional approach works well for standard cases, but I'd argue the more interesting angle is to examine the assumptions embedded in the question itself. Sometimes the framing determines the answer before any analysis begins.",
];

let responseIndex = 0;

async function fetchReply(): Promise<string> {
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
  return RESPONSES[responseIndex++ % RESPONSES.length];
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
    setInput("");
    setThinking(true);

    const reply = await fetchReply();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "assistant", content: reply },
    ]);
    setThinking(false);
  }, [input, thinking]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-surface">
      <header className="flex items-center px-6 h-12 border-b border-chrome shrink-0 bg-surface">
        <span className="text-sm font-light text-muted tracking-widest">
          assistant
        </span>
      </header>

      <div className="flex-1 overflow-y-auto notebook-lines">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
          {messages.length === 0 && !thinking && (
            <div
              className="flex items-center justify-center"
              style={{ minHeight: "60vh" }}
            >
              <p className="text-sm text-muted">
                Write your first message below.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "user" ? (
                <div className="max-w-[70%] bg-ink text-white text-sm px-4 py-2 rounded-2xl leading-8 whitespace-pre-wrap">
                  {msg.content}
                </div>
              ) : (
                <div className="flex items-start gap-2.5 max-w-full">
                  <span className="text-muted text-sm shrink-0 leading-8">
                    •
                  </span>
                  <p className="text-sm text-[#3D3D3D] leading-8 whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="flex items-start gap-2.5">
              <span className="text-muted text-sm shrink-0 leading-8">•</span>
              <div className="flex items-center gap-1.5 h-8">
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-chrome shrink-0 bg-surface">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write here..."
              rows={1}
              className="flex-1 field-sizing-content max-h-44 overflow-y-auto resize-none bg-transparent border-0 border-b border-chrome focus:border-accent focus:outline-none py-2 text-sm text-ink placeholder:text-muted transition-colors leading-relaxed"
            />
            <button
              onClick={send}
              disabled={!input.trim() || thinking}
              className="shrink-0 pb-2 text-accent hover:opacity-70 disabled:opacity-25 disabled:cursor-not-allowed transition-opacity"
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
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-muted mt-3">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
