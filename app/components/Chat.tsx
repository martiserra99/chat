"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useChat } from "../hooks/useChat";
import { WeatherCard } from "./WeatherCard";

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
    <div className="flex flex-col flex-1 bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
          {messages.length === 0 && !thinking && (
            <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
              <p className="text-sm text-gray-300">Send a message to start.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "user" ? (
                <div className="max-w-[75%] bg-gray-200 text-gray-900 text-sm px-4 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[85%] text-sm text-gray-900 leading-relaxed">
                  {msg.weather && <WeatherCard data={msg.weather} />}
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      h1: ({ children }) => <h1 className="font-semibold text-base mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="font-semibold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="font-medium mb-1">{children}</h3>,
                      code: ({ children, className }) =>
                        className ? (
                          <code className="block bg-gray-100 rounded-lg p-3 font-mono text-xs overflow-x-auto mb-3 whitespace-pre">{children}</code>
                        ) : (
                          <code className="bg-gray-100 rounded px-1 py-0.5 font-mono text-xs">{children}</code>
                        ),
                      pre: ({ children }) => <>{children}</>,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-200 pl-3 text-gray-500 mb-3">{children}</blockquote>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="flex items-center gap-1.5 h-7">
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:300ms]" />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-gray-100 shrink-0 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <div className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 flex items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message…"
                rows={1}
                className="flex-1 field-sizing-content max-h-44 overflow-y-auto resize-none bg-transparent border-0 focus:outline-none py-1 text-sm text-gray-900 placeholder:text-gray-400 leading-relaxed"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || thinking}
              className="shrink-0 w-11 bg-gray-900 text-white rounded-2xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              aria-label="Send message"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
