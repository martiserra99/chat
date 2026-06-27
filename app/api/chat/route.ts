import OpenAI from "openai";

const client = new OpenAI();

export async function POST(request: Request) {
  const { message } = await request.json();

  const openaiStream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: message }],
    stream: true,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of openaiStream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
