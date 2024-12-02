// lib/tools/getWeather.ts

import axios from "axios";
import { DateTime } from "luxon";

// Mapping for WMO (World Meteorological Organization) weather codes
const wmoWeatherCodes: { [key: string]: string } = {
  // Weather codes with corresponding descriptions
  "0": "Clear sky",
  "1": "Mainly clear, partly cloudy, and overcast",
  "2": "Mainly clear, partly cloudy, and overcast",
  "3": "Mainly clear, partly cloudy, and overcast",
  "45": "Fog and depositing rime fog",
  "48": "Fog and depositing rime fog",
  "51": "Drizzle: Light, moderate, and dense intensity",
  "53": "Drizzle: Light, moderate, and dense intensity",
  "55": "Drizzle: Light, moderate, and dense intensity",
  "56": "Freezing Drizzle: Light and dense intensity",
  "57": "Freezing Drizzle: Light and dense intensity",
  "61": "Rain: Slight, moderate, and heavy intensity",
  "63": "Rain: Slight, moderate and heavy intensity",
  "65": "Rain: Slight, moderate and heavy intensity",
  "66": "Freezing Rain: Light and heavy intensity",
  "67": "Freezing Rain: Light and heavy intensity",
  "71": "Snow fall: Slight, moderate, and heavy intensity",
  "73": "Snow fall: Slight, moderate, and heavy intensity",
  "75": "Snow fall: Slight, moderate, and heavy intensity",
  "77": "Snow grains",
  "80": "Rain showers: Slight, moderate, and violent",
  "81": "Rain showers: Slight, moderate, and violent",
  "82": "Rain showers: Slight, moderate, and violent",
  "85": "Snow showers slight and heavy",
  "86": "Snow showers slight and heavy",
  "95": "Thunderstorm: Slight or moderate",
  "96": "Thunderstorm with slight and heavy hail",
  "99": "Thunderstorm with slight and heavy hail",
};

/**
 * Fetches geographical information (latitude, longitude, timezone) for a given city.
 * @param city - The name of the city.
 * @returns A promise resolving to the city's geographical info or null if the API request fails.
 */
export async function getCityInfo(city: string): Promise<CityInfo | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=en&format=json`;
  try {
    const response = await axios.get(url);
    const data = response.data.results[0];
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    };
  } catch (error) {
    console.error(`Error fetching city info for ${city}:`, error);
    return null;
  }
}

/**
 * Fetches weather data from the Open Meteo API based on the given URL and parameters.
 * @param baseUrl - The base URL for the weather API.
 * @param params - Query parameters for the API request.
 * @returns A promise resolving to the weather data or an error message string if the request fails.
 */
export async function fetchWeatherData(
  baseUrl: string,
  params: any
): Promise<WeatherData | string> {
  try {
    const response = await axios.get(baseUrl, { params });
    if (response.data.error) {
      return `Error fetching weather data: ${response.data.message}`;
    }
    return response.data;
  } catch (error: any) {
    return `Error fetching weather data: ${error.message}`;
  }
}

/**
 * Formats a given ISO date string into a more human-readable format based on the provided timezone.
 * @param dateStr - ISO date string to format.
 * @param timeZone - The timezone in which to format the date.
 * @returns A formatted string representing the time.
 */
function formatDate(dateStr: string, timeZone: string): string {
  return DateTime.fromISO(dateStr, { zone: timeZone }).toFormat("h:mm a");
}

/**
 * Fetches and returns a formatted weather forecast for the next week for a given city.
 * @param city - The name of the city to get the weather forecast for.
 * @returns A promise resolving to a string with the formatted weather forecast or an error message if the operation fails.
 */
export async function getFutureWeatherWeek(city: string): Promise<string> {
  if (!city) {
    return "The location has not been defined by the user, so weather cannot be determined.";
  }

  const cityInfo = await getCityInfo(city);
  if (!cityInfo) {
    return "Error fetching weather data";
  }

  const { latitude, longitude, timezone } = cityInfo;

  const baseUrl = "https://api.open-meteo.com/v1/forecast";
  const params = {
    latitude,
    longitude,
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "uv_index_max",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ],
    timezone,
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    forecast_days: 7,
  };

  const data = await fetchWeatherData(baseUrl, params);
  if (typeof data === "string") {
    return data;
  }

  const formattedTimestamp = formatDate(data.timezone_abbreviation, timezone);
  data.time[0] += " (Today)";

  const mappedData = data.time.map((date, i) => ({
    date,
    weather_description: wmoWeatherCodes[data.weather_code[i]],
    temperature_max_min: `${data.temperature_2m_max[i]} ${data.daily_units.temperature_2m_max} / ${data.temperature_2m_min[i]} ${data.daily_units.temperature_2m_min}`,
    uv_index_max: `${data.uv_index_max[i]} ${data.daily_units.uv_index_max}`,
    precipitation_probability_max: `${data.precipitation_probability_max[i]} ${data.daily_units.precipitation_probability_max}`,
    max_wind_speed: `${data.wind_speed_10m_max[i]} ${data.daily_units.wind_speed_10m_max}`,
  }));

  return `
Give a weather description for the next week, include the time of the data (${formattedTimestamp} in ${city}):
Show a standard table layout of each of these days: ${JSON.stringify(
    mappedData
  )}
Include a one-sentence summary of the week at the end.
  `;
}

/**
 * Fetches and returns the current weather for a given city in a brief, formatted string.
 * @param city - The name of the city to get the current weather for.
 * @returns A promise resolving to a string with the formatted current weather data or an error message if the operation fails.
 */
export async function getCurrentWeather({
  city,
}: {
  city: string;
}): Promise<string> {
  if (!city) {
    return "The location has not been defined by the user, so weather cannot be determined.";
  }

  const cityInfo = await getCityInfo(city);
  if (!cityInfo) {
    return "Error fetching weather data";
  }

  const { latitude, longitude, timezone } = cityInfo;

  const baseUrl = "https://api.open-meteo.com/v1/forecast";
  const params = {
    latitude,
    longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "wind_speed_10m",
      "weather_code",
    ],
    timezone,
  };

  const data = await fetchWeatherData(baseUrl, params);
  if (typeof data === "string") {
    return data;
  }

  const formattedTimestamp = formatDate(data.current.time, timezone);
  data.current.weather_code = wmoWeatherCodes[data.current.weather_code];

  const formattedData = Object.entries(data.current)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ")
    .replace("weather_code", "weather_description");

  return `
Give a weather description, include the time of the data (${formattedTimestamp} in ${city}):
Include this data: [${formattedData}]
Ensure you mention the real temperature and the "feels like" (apparent_temperature) temperature.
Keep response as brief as possible.
  `;
}
