/**
 * ==============================================================================
 * OPENWEATHERMAP REST API CLIENT (js/api.js)
 * Datheon Full Stack Web Development Internship – Task 3
 *
 * Asynchronous integration layer for:
 * - Direct Geocoding (https://api.openweathermap.org/geo/1.0/direct)
 * - Reverse Geocoding (https://api.openweathermap.org/geo/1.0/reverse)
 * - Current Weather (https://api.openweathermap.org/data/2.5/weather)
 * - 5-Day Forecast (https://api.openweathermap.org/data/2.5/forecast)
 * - Air Pollution / AQI (https://api.openweathermap.org/data/2.5/air_pollution)
 *
 * Handles timeouts, AbortController race-condition prevention, and HTTP errors.
 * Never returns fabricated weather telemetry.
 * ==============================================================================
 */

let activeController = null;

class WeatherApiError extends Error {
  constructor(message, code = "API_ERROR", status = 0) {
    super(message);
    this.name = "WeatherApiError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Resolves active API key from browser storage or config.js
 * @returns {string}
 */
function getApiKey() {
  try {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_API_KEY);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch (err) {
    // Ignore storage restriction errors
  }
  return (CONFIG.API_KEY || "").trim();
}

/**
 * Checks whether either a serverless proxy or a client API key is configured
 * @returns {boolean}
 */
function hasTelemetryCredentials() {
  if (CONFIG.USE_SERVERLESS_PROXY) return true;
  return getApiKey().length > 0;
}

/**
 * Builds request URL for either direct OpenWeatherMap API or serverless proxy
 * @param {"geo"|"reverse"|"weather"|"forecast"|"air_pollution"} type
 * @param {Record<string, string|number>} queryParams
 * @returns {string}
 */
function buildEndpointUrl(type, queryParams) {
  if (CONFIG.USE_SERVERLESS_PROXY) {
    const proxyParams = new URLSearchParams({ type, ...queryParams });
    return `${CONFIG.PROXY_ENDPOINT}?${proxyParams.toString()}`;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new WeatherApiError(
      "OpenWeatherMap API key is missing. Click 'Enter API Key' to configure your key.",
      "MISSING_API_KEY",
      401
    );
  }

  const endpointMap = {
    geo: CONFIG.ENDPOINTS.GEOCODING_DIRECT,
    reverse: CONFIG.ENDPOINTS.GEOCODING_REVERSE,
    weather: CONFIG.ENDPOINTS.CURRENT_WEATHER,
    forecast: CONFIG.ENDPOINTS.FORECAST_5DAY,
    air_pollution: CONFIG.ENDPOINTS.AIR_POLLUTION
  };

  const baseUrl = endpointMap[type];
  const params = new URLSearchParams({ ...queryParams, appid: apiKey });
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Executes fetch() with AbortController timeout and offline verification
 * @param {string} url
 * @param {AbortSignal} parentSignal
 * @returns {Promise<any>}
 */
async function requestJson(url, parentSignal) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new WeatherApiError(
      "Network unavailable. Please check your internet connection and try again.",
      "NETWORK_UNAVAILABLE",
      0
    );
  }

  const timeoutController = new AbortController();
  let timedOut = false;

  const timerId = setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, CONFIG.REQUEST_TIMEOUT_MS || 10000);

  const forwardAbort = () => timeoutController.abort();
  if (parentSignal) {
    if (parentSignal.aborted) {
      clearTimeout(timerId);
      throw new WeatherApiError("Request superseded by a newer search.", "ABORTED", 499);
    }
    parentSignal.addEventListener("abort", forwardAbort, { once: true });
  }

  try {
    const response = await fetch(url, { signal: timeoutController.signal });

    if (!response.ok) {
      mapHttpStatusToError(response.status);
    }

    try {
      return await response.json();
    } catch (parseErr) {
      throw new WeatherApiError(
        "Weather service returned an unexpected data format.",
        "INVALID_RESPONSE",
        response.status
      );
    }
  } catch (err) {
    if (err instanceof WeatherApiError) {
      throw err;
    }
    if (err.name === "AbortError") {
      if (timedOut) {
        throw new WeatherApiError(
          "The weather service took too long to respond. Please try again.",
          "TIMEOUT",
          408
        );
      }
      throw new WeatherApiError("Request superseded by a newer search.", "ABORTED", 499);
    }
    throw new WeatherApiError(
      "Unable to reach the weather service. Check your internet connection.",
      "NETWORK_UNAVAILABLE",
      0
    );
  } finally {
    clearTimeout(timerId);
    if (parentSignal) {
      parentSignal.removeEventListener("abort", forwardAbort);
    }
  }
}

/**
 * Translates HTTP status codes into user-friendly error messages
 * @param {number} status
 */
function mapHttpStatusToError(status) {
  switch (status) {
    case 401:
      throw new WeatherApiError(
        "Invalid or inactive API key. Verify your OpenWeatherMap key in settings.",
        "INVALID_API_KEY",
        401
      );
    case 404:
      throw new WeatherApiError(
        "City not found. Please check the spelling and try again.",
        "CITY_NOT_FOUND",
        404
      );
    case 429:
      throw new WeatherApiError(
        "API rate limit exceeded. Please wait a minute before making another request.",
        "RATE_LIMITED",
        429
      );
    case 500:
    case 502:
    case 503:
    case 504:
      throw new WeatherApiError(
        "Weather servers are temporarily unavailable. Please try again shortly.",
        "SERVER_UNAVAILABLE",
        status
      );
    default:
      throw new WeatherApiError(
        `Weather request failed (HTTP ${status}). Please try again.`,
        "API_ERROR",
        status
      );
  }
}

/**
 * 1. Geocodes a city name into exact geographic coordinates
 * @param {string} cityName
 * @param {AbortSignal} signal
 * @returns {Promise<{name: string, country: string, state: string, lat: number, lon: number}>}
 */
async function geocodeCity(cityName, signal) {
  const cleaned = (cityName || "").trim();
  if (!cleaned) {
    throw new WeatherApiError("Please enter a city name to search.", "EMPTY_INPUT", 400);
  }

  const url = buildEndpointUrl("geo", { q: cleaned, limit: 1 });
  const results = await requestJson(url, signal);

  if (!Array.isArray(results) || results.length === 0) {
    throw new WeatherApiError(
      `No matching city found for "${cleaned}". Please verify the spelling.`,
      "CITY_NOT_FOUND",
      404
    );
  }

  const topMatch = results[0];
  return {
    name: topMatch.name,
    country: topMatch.country || "",
    state: topMatch.state || "",
    lat: topMatch.lat,
    lon: topMatch.lon
  };
}

/**
 * Reverse geocodes GPS coordinates to a readable place name
 * @param {number} lat
 * @param {number} lon
 * @param {AbortSignal} signal
 */
async function reverseGeocode(lat, lon, signal) {
  try {
    const url = buildEndpointUrl("reverse", { lat, lon, limit: 1 });
    const results = await requestJson(url, signal);
    if (Array.isArray(results) && results.length > 0) {
      return {
        name: results[0].name,
        country: results[0].country || "",
        state: results[0].state || "",
        lat,
        lon
      };
    }
  } catch (err) {
    if (err.code === "ABORTED") throw err;
  }
  return { name: null, country: "", state: "", lat, lon };
}

/**
 * 2. Retrieves Current Weather by geographic coordinates
 * @param {number} lat
 * @param {number} lon
 * @param {AbortSignal} signal
 */
async function fetchCurrentWeather(lat, lon, signal) {
  const url = buildEndpointUrl("weather", { lat, lon, units: "metric" });
  const data = await requestJson(url, signal);

  if (!data || !data.main || typeof data.main.temp !== "number") {
    throw new WeatherApiError("Incomplete current weather data received.", "INVALID_RESPONSE", 502);
  }
  return data;
}

/**
 * 3. Retrieves 5-Day / 3-Hour Forecast by geographic coordinates
 * @param {number} lat
 * @param {number} lon
 * @param {AbortSignal} signal
 */
async function fetchForecast(lat, lon, signal) {
  const url = buildEndpointUrl("forecast", { lat, lon, units: "metric" });
  const data = await requestJson(url, signal);

  if (!data || !Array.isArray(data.list) || data.list.length === 0) {
    throw new WeatherApiError("Incomplete 5-day forecast data received.", "INVALID_RESPONSE", 502);
  }
  return data;
}

/**
 * 4. Retrieves Air Quality Index (AQI) via OpenWeatherMap Air Pollution API
 * Gracefully returns null if unavailable without breaking primary weather display.
 * @param {number} lat
 * @param {number} lon
 * @param {AbortSignal} signal
 */
async function fetchAirQuality(lat, lon, signal) {
  try {
    const url = buildEndpointUrl("air_pollution", { lat, lon });
    const data = await requestJson(url, signal);
    if (data && Array.isArray(data.list) && data.list.length > 0) {
      return data.list[0];
    }
    return null;
  } catch (err) {
    if (err.code === "ABORTED") throw err;
    return null;
  }
}

/**
 * Full pipeline: Geocode city -> concurrently fetch current weather, forecast & AQI
 * Cancels any previously running search to eliminate race conditions.
 * @param {string} cityQuery
 */
async function retrieveWeatherByCity(cityQuery) {
  const cleaned = (cityQuery || "").trim();
  if (!cleaned) {
    throw new WeatherApiError("Please enter a city name to search.", "EMPTY_INPUT", 400);
  }

  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();
  const signal = activeController.signal;

  try {
    const location = await geocodeCity(cleaned, signal);
    const [current, forecast, airQuality] = await Promise.all([
      fetchCurrentWeather(location.lat, location.lon, signal),
      fetchForecast(location.lat, location.lon, signal),
      fetchAirQuality(location.lat, location.lon, signal)
    ]);

    return { location, current, forecast, airQuality };
  } finally {
    if (activeController && activeController.signal === signal) {
      activeController = null;
    }
  }
}

/**
 * Full pipeline by GPS coordinates (Geolocation)
 * @param {number} lat
 * @param {number} lon
 */
async function retrieveWeatherByCoordinates(lat, lon) {
  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();
  const signal = activeController.signal;

  try {
    const [location, current, forecast, airQuality] = await Promise.all([
      reverseGeocode(lat, lon, signal),
      fetchCurrentWeather(lat, lon, signal),
      fetchForecast(lat, lon, signal),
      fetchAirQuality(lat, lon, signal)
    ]);

    const resolvedLocation = {
      name: location.name || current.name || "Current Location",
      country: location.country || (current.sys && current.sys.country) || "",
      state: location.state || "",
      lat,
      lon
    };

    return { location: resolvedLocation, current, forecast, airQuality };
  } finally {
    if (activeController && activeController.signal === signal) {
      activeController = null;
    }
  }
}
