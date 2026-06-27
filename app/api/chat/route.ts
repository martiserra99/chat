import OpenAI from "openai";

const client = new OpenAI();

export async function POST(request: Request) {
  const { message, previousResponseId } = await request.json();

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

  // response.created is always the first event — peek at it to get the ID
  // before we start streaming, so we can set it as a response header.
  const iterator = apiStream[Symbol.asyncIterator]();
  const first = await iterator.next();
  const responseId =
    first.value?.type === "response.created" ? first.value.response.id : "";

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
