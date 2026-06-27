import OpenAI from "openai";

const client = new OpenAI();

async function fileSearch(message: string, previousResponseId: string | null) {
  const apiStream = await client.responses.create({
    model: "gpt-4o-mini",
    input: message,
    tools: [
      {
        type: "file_search",
        vector_store_ids: [process.env.OPENAI_VECTOR_STORE_ID!],
      },
    ],
    previous_response_id: previousResponseId ?? undefined,
    stream: true,
  });

  const iterator = apiStream[Symbol.asyncIterator]();
  const first = await iterator.next();
  const responseId =
    first.value?.type === "response.created" ? first.value.response.id : "";

  return { iterator, responseId };
}

export async function POST(request: Request) {
  const { message, previousResponseId } = await request.json();
  const { iterator, responseId } = await fileSearch(message, previousResponseId);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { value: event, done } = await iterator.next();
        if (done) break;
        if (event.type === "response.output_text.delta" && event.delta) {
          controller.enqueue(encoder.encode(event.delta));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Response-Id": responseId,
    },
  });
}
