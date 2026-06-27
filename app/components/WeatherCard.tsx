import { WeatherData } from "../hooks/useChat";

export function WeatherCard({ data }: { data: WeatherData }) {
  return (
    <div className="inline-flex flex-col bg-gray-100 rounded-2xl px-5 py-4 mb-3 min-w-40">
      <span className="text-xs text-gray-400 mb-2">{data.city}</span>
      <span className="text-5xl font-light text-gray-900 tracking-tight">{data.temperature}°</span>
      <span className="text-sm text-gray-600 mt-2">{data.condition}</span>
      <span className="text-xs text-gray-400 mt-1">Wind {data.windSpeed} km/h</span>
    </div>
  );
}
