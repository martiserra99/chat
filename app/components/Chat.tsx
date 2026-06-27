"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const aiId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: aiId, role: "assistant", content: "" },
    ]);
    setThinking(false);

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      setMessages((prev) =>
        prev.map((m) => (m.id === aiId ? { ...m, content: m.content + chunk } : m))
      );
    }
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
                <div className="border-l-2 border-chrome pl-4 max-w-full">
                  <p className="text-sm text-[#3D3D3D] leading-8 whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="border-l-2 border-chrome pl-4">
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
