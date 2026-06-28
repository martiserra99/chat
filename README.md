# Chat

A streaming AI chat app built with Next.js, powered by the OpenAI Responses API (`gpt-4o-mini`).

## Features

- Streaming responses via NDJSON
- Multi-turn conversation using `previous_response_id`
- Weather tool — ask about current conditions in any city (via Open-Meteo, no API key required)
- Optional file search via an OpenAI Vector Store
- Markdown rendering in assistant messages

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```env
OPENAI_API_KEY=sk-...

# Optional: enables file search over an existing OpenAI Vector Store
OPENAI_VECTOR_STORE_ID=vs-...
```

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **OpenAI SDK** — Responses API with streaming
- **Tailwind CSS v4**
- **react-markdown**
