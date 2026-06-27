const RESPONSES = [
  "I understand what you're asking. Let me think through this carefully.\n\nBased on what you've described, the most important thing to consider is the underlying structure of the problem. When we look at it from first principles, a few key patterns emerge that can guide the solution.",
  "That's an interesting question. The short answer is: it depends on context.\n\nThe longer answer involves weighing several factors — the constraints you're working within, the outcomes you're optimizing for, and the tradeoffs you're willing to accept. What matters most here is being explicit about your priorities.",
  "Let me break this down into parts.\n\nFirst, the foundational concept you need to understand is how the system behaves under normal conditions. Second, you should consider the edge cases — these are where most real-world complications arise. Finally, think about how these pieces fit together in practice.",
  "Good question. Here's how I'd approach it.\n\nStart by identifying what you already know versus what you need to find out. Then work backwards from the desired outcome. Often the path forward becomes clearer once you're specific about where you want to end up.",
  "There are a few ways to think about this.\n\nThe conventional approach works well for standard cases, but I'd argue the more interesting angle is to examine the assumptions embedded in the question itself. Sometimes the framing determines the answer before any analysis begins.",
]

let responseIndex = 0

export async function POST() {
  const reply = RESPONSES[responseIndex++ % RESPONSES.length]
  const words = reply.split(" ")
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        controller.enqueue(encoder.encode((i === 0 ? "" : " ") + words[i]))
        await new Promise((r) => setTimeout(r, 40))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  })
}
