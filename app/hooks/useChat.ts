"use client";

import { useState } from "react";

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  windSpeed: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  weather?: WeatherData;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(null);

  async function send(text: string) {
    if (!text || thinking) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: text }]);
    setThinking(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, previousResponseId }),
    });

    const aiId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: aiId, role: "assistant", content: "" }]);
    setThinking(false);

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop()!;

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);

        if (event.type === "text") {
          setMessages((prev) =>
            prev.map((m) => m.id === aiId ? { ...m, content: m.content + event.data } : m)
          );
        } else if (event.type === "weather") {
          setMessages((prev) =>
            prev.map((m) => m.id === aiId ? { ...m, weather: event.data } : m)
          );
        } else if (event.type === "done") {
          setPreviousResponseId(event.responseId);
        }
      }
    }
  }

  return { messages, thinking, send };
}
