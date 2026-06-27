"use client";

import { useState } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(null);

  async function send(text: string) {
    if (!text || thinking) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
    setThinking(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, previousResponseId }),
    });

    const newResponseId = res.headers.get("X-Response-Id");
    if (newResponseId) setPreviousResponseId(newResponseId);

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
  }

  return { messages, thinking, send };
}
