import OpenAI from "openai";

const client = new OpenAI();
const encoder = new TextEncoder();

interface WeatherArgs {
  city: string;
}

const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Icy fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm",
};

async function getWeather({ city }: WeatherArgs) {
  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
  ).then((r) => r.json());
  const loc = geo.results?.[0];
  if (!loc) throw new Error(`City not found: ${city}`);

  const wx = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code,wind_speed_10m`,
  ).then((r) => r.json());
  const c = wx.current;

  return {
    city: loc.name,
    temperature: Math.round(c.temperature_2m),
    condition: WMO_CONDITIONS[c.weather_code] ?? "Unknown",
    windSpeed: Math.round(c.wind_speed_10m),
  };
}

const tools: OpenAI.Responses.Tool[] = [
  ...(process.env.OPENAI_VECTOR_STORE_ID
    ? [
        {
          type: "file_search" as const,
          vector_store_ids: [process.env.OPENAI_VECTOR_STORE_ID],
        },
      ]
    : []),
  {
    type: "function",
    name: "get_weather",
    description: "Get the current weather for a city",
    strict: false,
    parameters: {
      type: "object",
      properties: { city: { type: "string", description: "City name" } },
      required: ["city"],
    },
  },
];

function emit(controller: ReadableStreamDefaultController, event: object) {
  controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
}

async function fileSearch(message: string, previousResponseId: string | null) {
  return client.responses.create({
    model: "gpt-4o-mini",
    input: message,
    instructions:
      "When asked about current weather, always call the get_weather tool. Never guess or invent weather data.",
    tools,
    previous_response_id: previousResponseId,
    stream: true,
  });
}

export async function POST(request: Request) {
  const { message, previousResponseId } = await request.json();
  const apiStream = await fileSearch(message, previousResponseId);

  const stream = new ReadableStream({
    async start(controller) {
      let firstResponseId = "";
      let finalResponseId = "";
      let toolCall: {
        call_id: string;
        name: string;
        arguments: string;
      } | null = null;

      try {
        for await (const event of apiStream) {
          if (event.type === "response.created") {
            firstResponseId = event.response.id;
          } else if (
            event.type === "response.output_text.delta" &&
            event.delta
          ) {
            emit(controller, { type: "text", data: event.delta });
          } else if (
            event.type === "response.output_item.done" &&
            event.item.type === "function_call"
          ) {
            toolCall = {
              call_id: event.item.call_id,
              name: event.item.name,
              arguments: event.item.arguments,
            };
          } else if (event.type === "response.completed") {
            finalResponseId = event.response.id;
          }
        }

        if (toolCall?.name === "get_weather") {
          const weatherData = await getWeather(JSON.parse(toolCall.arguments));
          emit(controller, { type: "weather", data: weatherData });

          const followUp = await client.responses.create({
            model: "gpt-4o-mini",
            previous_response_id: firstResponseId,
            input: [
              {
                type: "function_call_output",
                call_id: toolCall.call_id,
                output: JSON.stringify(weatherData),
              },
            ],
            tools,
            stream: true,
          });

          for await (const event of followUp) {
            if (event.type === "response.output_text.delta" && event.delta) {
              emit(controller, { type: "text", data: event.delta });
            } else if (event.type === "response.completed") {
              finalResponseId = event.response.id;
            }
          }
        }

        emit(controller, { type: "done", responseId: finalResponseId });
      } catch (err) {
        console.error("[chat route]", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}
