/**
 * ==============================================================================
 * APPLICATION CONFIGURATION (js/config.js)
 * Datheon Full Stack Web Development Internship – Task 3
 * 
 * SECURITY NOTICE:
 * - Never commit real OpenWeatherMap API keys to public repositories.
 * - For local static testing, add your key below OR enter it inside the
 *   browser's "API Setup" modal (stored locally in your browser only).
 * - For production deployments (Vercel / Netlify), set USE_SERVERLESS_PROXY
 *   to true and define OPENWEATHER_API_KEY in your host's environment variables.
 * ==============================================================================
 */

const CONFIG = {
  // Optional: Paste your OpenWeatherMap API key here for local development only.
  // Leave blank ("") before committing to GitHub.
  API_KEY: "",

  // Set to true when deployed with the /api/weather serverless proxy function
  USE_SERVERLESS_PROXY: false,
  PROXY_ENDPOINT: "/api/weather",

  // Official OpenWeatherMap REST API Endpoints
  ENDPOINTS: {
    GEOCODING_DIRECT: "https://api.openweathermap.org/geo/1.0/direct",
    GEOCODING_REVERSE: "https://api.openweathermap.org/geo/1.0/reverse",
    CURRENT_WEATHER: "https://api.openweathermap.org/data/2.5/weather",
    FORECAST_5DAY: "https://api.openweathermap.org/data/2.5/forecast",
    AIR_POLLUTION: "https://api.openweathermap.org/data/2.5/air_pollution"
  },

  // Network Request Settings
  REQUEST_TIMEOUT_MS: 10000,

  // User Defaults
  DEFAULT_UNIT: "metric", // "metric" (°C) | "imperial" (°F)
  DEFAULT_THEME_MODE: "auto", // "auto" (weather/day-night) | "light"
  DEFAULT_CITY: "Coimbatore",

  // Web Storage Keys (no secrets committed to repo)
  STORAGE_KEYS: {
    UNIT_PREFERENCE: "strata_weather_unit",
    THEME_MODE: "strata_weather_theme_mode",
    LAST_CITY: "strata_weather_last_city",
    RECENT_CITIES: "strata_weather_recent_cities",
    USER_API_KEY: "strata_weather_user_api_key"
  },

  MAX_RECENT_CITIES: 5
};

Object.freeze(CONFIG);
Object.freeze(CONFIG.ENDPOINTS);
Object.freeze(CONFIG.STORAGE_KEYS);
