// Interfaces for Geocoding Response
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface GeocodingResponse {
  results: GeocodingResult[];
}

// Interfaces for Weather API
export interface WeatherDailyData {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  uv_index_max: number[];
  precipitation_probability_max: number[];
  windspeed_10m_max: number[];
}

export interface WeatherDailyUnits {
  temperature_2m_max: string;
  temperature_2m_min: string;
  uv_index_max: string;
  precipitation_probability_max: string;
  windspeed_10m_max: string;
}

export interface WeatherApiResponse {
  timezone_abbreviation: string;
  time: string[];
  current: {
    time: string;
    weather_code: string;
  };
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  uv_index_max: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  daily_units: {
    temperature_2m_max: string;
    temperature_2m_min: string;
    uv_index_max: string;
    precipitation_probability_max: string;
    wind_speed_10m_max: string;
  };
}

export interface WeatherData {
  timezone_abbreviation: string;
  daily: WeatherDailyData;
  daily_units: WeatherDailyUnits;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  windspeed_10m: number;
  weathercode: number;
}

export interface CurrentWeatherData {
  current_weather: CurrentWeather;
}
