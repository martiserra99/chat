"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export function Chat() {
  const { messages, thinking, send } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function handleSubmit() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await send(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-stone-50">
      <header className="flex items-center px-6 h-12 border-b border-gray-200 shrink-0 bg-stone-50">
        <span className="text-sm font-light text-gray-400 tracking-widest">
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
                <div className="max-w-[70%] bg-gray-900 text-white text-sm px-4 py-2 rounded-2xl leading-8 whitespace-pre-wrap">
                  {msg.content}
                </div>
              ) : (
                <div className="border-l-2 border-gray-200 pl-4 max-w-full">
                  <p className="text-sm text-gray-700 leading-8 whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="border-l-2 border-gray-200 pl-4">
              <div className="flex items-center gap-1.5 h-8">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 shrink-0 bg-stone-50">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write here..."
              rows={1}
              className="flex-1 field-sizing-content max-h-44 overflow-y-auto resize-none bg-transparent border-0 border-b border-gray-200 focus:border-gray-600 focus:outline-none py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors leading-relaxed"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || thinking}
              className="shrink-0 pb-2 text-gray-600 hover:opacity-70 disabled:opacity-25 disabled:cursor-not-allowed transition-opacity"
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
          <p className="text-[11px] text-gray-400 mt-3">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
