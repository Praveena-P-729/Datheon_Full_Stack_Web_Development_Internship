/**
 * ==============================================================================
 * WEATHER DATA PROCESSING & FORECAST ENGINE (js/weather.js)
 * Datheon Full Stack Web Development Internship – Task 3
 *
 * Responsibilities:
 * - Normalize raw OpenWeatherMap responses into structured view models
 * - Group 3-hour forecast slices by city local calendar date
 * - Compute daily min/max temperatures and representative midday conditions
 * - Map weather conditions & day/night status to SVG icons and color themes
 * - Render forecast rows dynamically using Array.map()
 * ==============================================================================
 */

const AQI_LABELS = {
  1: "Good",
  2: "Fair",
  3: "Moderate",
  4: "Poor",
  5: "Very Poor"
};

const WEATHER_PRIORITY = {
  Thunderstorm: 10,
  Snow: 9,
  Rain: 8,
  Drizzle: 7,
  Mist: 6,
  Fog: 6,
  Haze: 6,
  Smoke: 6,
  Dust: 6,
  Clouds: 4,
  Clear: 2
};

/**
 * Converts Celsius temperature to requested unit without mutating source
 * @param {number|null|undefined} celsius
 * @param {"metric"|"imperial"} unit
 * @returns {number|null}
 */
function convertTemperature(celsius, unit) {
  if (typeof celsius !== "number" || Number.isNaN(celsius)) return null;
  if (unit === "imperial") {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * Formats wind speed from m/s (metric API base) to km/h or mph
 * @param {number|null|undefined} metersPerSec
 * @param {"metric"|"imperial"} unit
 * @returns {string}
 */
function formatWindSpeed(metersPerSec, unit) {
  if (typeof metersPerSec !== "number" || Number.isNaN(metersPerSec)) return "—";
  if (unit === "imperial") {
    const mph = (metersPerSec * 2.23694).toFixed(1);
    return `${mph} mph`;
  }
  const kmh = (metersPerSec * 3.6).toFixed(1);
  return `${kmh} km/h`;
}

/**
 * Formats visibility from meters to km or miles
 * @param {number|null|undefined} meters
 * @param {"metric"|"imperial"} unit
 * @returns {string}
 */
function formatVisibility(meters, unit) {
  if (typeof meters !== "number" || Number.isNaN(meters)) return "—";
  if (unit === "imperial") {
    return `${(meters / 1609.34).toFixed(1)} mi`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Converts wind azimuth degrees to 16-point compass cardinal label
 * @param {number|undefined} deg
 * @returns {string}
 */
function getCompassDirection(deg) {
  if (typeof deg !== "number" || Number.isNaN(deg)) return "—";
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/**
 * Computes YYYY-MM-DD key in target city's local timezone
 * @param {number} unixSeconds
 * @param {number} timezoneOffsetSeconds
 * @returns {string}
 */
function getCityCalendarDateKey(unixSeconds, timezoneOffsetSeconds = 0) {
  const d = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Formats a Unix timestamp in city's local HH:MM (24-hour) format
 * @param {number|undefined} unixSeconds
 * @param {number} timezoneOffsetSeconds
 * @returns {string}
 */
function formatCityTime(unixSeconds, timezoneOffsetSeconds = 0) {
  if (typeof unixSeconds !== "number") return "—";
  const d = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Formats target city's current date and local time
 * @param {number} timezoneOffsetSeconds
 * @returns {string}
 */
function formatCityDateTime(timezoneOffsetSeconds = 0) {
  const nowCityMs = Date.now() + timezoneOffsetSeconds * 1000;
  const d = new Date(nowCityMs);
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  });
}

/**
 * Formats UTC offset badge (e.g., UTC+5:30 or UTC-04:00)
 * @param {number} offsetSeconds
 * @returns {string}
 */
function formatUtcOffset(offsetSeconds = 0) {
  const sign = offsetSeconds >= 0 ? "+" : "-";
  const absMins = Math.abs(Math.round(offsetSeconds / 60));
  const hrs = Math.floor(absMins / 60);
  const mins = absMins % 60;
  return mins === 0 ? `UTC${sign}${hrs}` : `UTC${sign}${hrs}:${String(mins).padStart(2, "0")}`;
}

/**
 * Calculates total daylight span between sunrise and sunset
 * @param {number|undefined} sunrise
 * @param {number|undefined} sunset
 * @returns {string}
 */
function formatDaylightDuration(sunrise, sunset) {
  if (typeof sunrise !== "number" || typeof sunset !== "number" || sunset <= sunrise) {
    return "—";
  }
  const diffMins = Math.round((sunset - sunrise) / 60);
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hrs}h ${mins}m daylight`;
}

/**
 * Maps OpenWeatherMap condition + icon code to original SVG icon path
 * @param {string} weatherMain
 * @param {string} iconCode
 * @returns {string}
 */
function resolveWeatherIcon(weatherMain, iconCode = "") {
  const isNight = iconCode.endsWith("n");
  const main = (weatherMain || "").toLowerCase();

  switch (main) {
    case "clear":
      return isNight ? "assets/icons/clear-night.svg" : "assets/icons/clear-day.svg";
    case "clouds":
      if (iconCode === "02d" || iconCode === "02n") {
        return isNight ? "assets/icons/partly-cloudy-night.svg" : "assets/icons/partly-cloudy-day.svg";
      }
      return "assets/icons/cloudy.svg";
    case "drizzle":
      return "assets/icons/drizzle.svg";
    case "rain":
      return "assets/icons/rain.svg";
    case "thunderstorm":
      return "assets/icons/thunderstorm.svg";
    case "snow":
      return "assets/icons/snow.svg";
    case "mist":
    case "fog":
    case "haze":
    case "smoke":
    case "dust":
    case "sand":
    case "ash":
    case "squall":
    case "tornado":
      return "assets/icons/mist.svg";
    default:
      return isNight ? "assets/icons/clear-night.svg" : "assets/icons/cloudy.svg";
  }
}

/**
 * Determines atmospheric color theme class from weather condition and day/night status
 * Maps cleanly to the 4 atmospheric palettes: clear-day, cloudy, rainy, night
 * @param {string} weatherMain
 * @param {string} iconCode
 * @returns {"atmosphere-clear-day"|"atmosphere-cloudy"|"atmosphere-rainy"|"atmosphere-night"}
 */
function resolveAtmosphereClass(weatherMain, iconCode = "") {
  const isNight = iconCode.endsWith("n");
  const main = (weatherMain || "").toLowerCase();

  if (main === "rain" || main === "drizzle" || main === "thunderstorm") {
    return "atmosphere-rainy";
  }
  if (isNight) {
    return "atmosphere-night";
  }
  if (main === "clouds" || main === "mist" || main === "fog" || main === "haze" || main === "smoke") {
    return "atmosphere-cloudy";
  }
  return "atmosphere-clear-day";
}

/**
 * Normalizes Current Weather & Air Quality API payloads
 * @param {Object} locationMeta
 * @param {Object} currentPayload
 * @param {Object|null} airQualityPayload
 */
function processCurrentWeather(locationMeta, currentPayload, airQualityPayload = null) {
  const weatherInfo = (currentPayload.weather && currentPayload.weather[0]) || {};
  const main = currentPayload.main || {};
  const wind = currentPayload.wind || {};
  const sys = currentPayload.sys || {};
  const coord = currentPayload.coord || {};
  const timezone = typeof currentPayload.timezone === "number" ? currentPayload.timezone : 0;

  const weatherMain = weatherInfo.main || "Clear";
  const iconCode = weatherInfo.icon || "01d";

  let aqi = null;
  if (airQualityPayload && airQualityPayload.main && airQualityPayload.main.aqi) {
    const aqiIndex = airQualityPayload.main.aqi;
    const pm25 = airQualityPayload.components && typeof airQualityPayload.components.pm2_5 === "number"
      ? airQualityPayload.components.pm2_5.toFixed(1)
      : null;

    aqi = {
      index: aqiIndex,
      label: AQI_LABELS[aqiIndex] || "Unknown",
      pm25: pm25 ? `${pm25} µg/m³` : "—"
    };
  }

  return {
    city: (locationMeta && locationMeta.name) || currentPayload.name || "Unknown City",
    country: (locationMeta && locationMeta.country) || sys.country || "—",
    state: (locationMeta && locationMeta.state) || "",
    timezoneOffset: timezone,
    localDateTime: formatCityDateTime(timezone),
    utcOffsetLabel: formatUtcOffset(timezone),
    tempCelsius: main.temp,
    feelsLikeCelsius: main.feels_like,
    tempMinCelsius: main.temp_min,
    tempMaxCelsius: main.temp_max,
    humidity: typeof main.humidity === "number" ? main.humidity : null,
    pressure: typeof main.pressure === "number" ? main.pressure : null,
    windSpeedMs: typeof wind.speed === "number" ? wind.speed : null,
    windDeg: typeof wind.deg === "number" ? wind.deg : null,
    visibilityMeters: typeof currentPayload.visibility === "number" ? currentPayload.visibility : null,
    cloudCover: currentPayload.clouds && typeof currentPayload.clouds.all === "number" ? currentPayload.clouds.all : null,
    sunriseText: formatCityTime(sys.sunrise, timezone),
    sunsetText: formatCityTime(sys.sunset, timezone),
    daylightDuration: formatDaylightDuration(sys.sunrise, sys.sunset),
    weatherMain,
    weatherDescription: weatherInfo.description || weatherMain,
    iconCode,
    iconPath: resolveWeatherIcon(weatherMain, iconCode),
    atmosphereClass: resolveAtmosphereClass(weatherMain, iconCode),
    lat: typeof coord.lat === "number" ? coord.lat : (locationMeta && locationMeta.lat),
    lon: typeof coord.lon === "number" ? coord.lon : (locationMeta && locationMeta.lon),
    observedTimestamp: currentPayload.dt || Math.floor(Date.now() / 1000),
    aqi
  };
}

/**
 * Aggregates OpenWeatherMap 3-hour interval forecast into 5 calendar day summaries
 * @param {Object} forecastPayload
 * @returns {Array<Object>}
 */
function processForecastData(forecastPayload) {
  if (!forecastPayload || !Array.isArray(forecastPayload.list) || forecastPayload.list.length === 0) {
    return [];
  }

  const timezoneOffset =
    forecastPayload.city && typeof forecastPayload.city.timezone === "number"
      ? forecastPayload.city.timezone
      : 0;

  const todayKey = getCityCalendarDateKey(Math.floor(Date.now() / 1000), timezoneOffset);
  const grouped = new Map();

  forecastPayload.list.forEach((entry) => {
    const key = getCityCalendarDateKey(entry.dt, timezoneOffset);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(entry);
  });

  const sortedKeys = Array.from(grouped.keys()).sort();
  let selectedKeys = sortedKeys.filter((k) => k !== todayKey);

  // If fewer than 5 future days exist, include today if it has multiple intervals
  if (selectedKeys.length < 5 && grouped.has(todayKey) && grouped.get(todayKey).length >= 2) {
    selectedKeys = sortedKeys;
  }

  selectedKeys = selectedKeys.slice(0, 5);

  return selectedKeys.map((dateKey) => {
    const entries = grouped.get(dateKey);

    let minC = Infinity;
    let maxC = -Infinity;

    entries.forEach((item) => {
      const low = item.main && typeof item.main.temp_min === "number" ? item.main.temp_min : item.main.temp;
      const high = item.main && typeof item.main.temp_max === "number" ? item.main.temp_max : item.main.temp;
      if (low < minC) minC = low;
      if (high > maxC) maxC = high;
    });

    // Prefer midday slice (11:00–15:00 city local time) for representative daytime weather
    let rep = entries.find((item) => {
      const localHour = new Date((item.dt + timezoneOffset) * 1000).getUTCHours();
      return localHour >= 11 && localHour <= 15;
    });

    if (!rep) {
      rep = entries.reduce((best, curr) => {
        const bestMain = best.weather && best.weather[0] ? best.weather[0].main : "";
        const currMain = curr.weather && curr.weather[0] ? curr.weather[0].main : "";
        return (WEATHER_PRIORITY[currMain] || 0) > (WEATHER_PRIORITY[bestMain] || 0) ? curr : best;
      }, entries[0]);
    }

    const w = (rep.weather && rep.weather[0]) || {};
    const weatherMain = w.main || "Clear";
    const iconCode = w.icon || "01d";
    const sampleDate = new Date((entries[0].dt + timezoneOffset) * 1000);

    return {
      dateKey,
      dayName: sampleDate.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      dateLabel: sampleDate.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      minCelsius: minC,
      maxCelsius: maxC,
      weatherMain,
      description: w.description || weatherMain,
      iconPath: resolveWeatherIcon(weatherMain, iconCode.replace("n", "d"))
    };
  });
}

/**
 * Dynamically generates and renders 5-day forecast rows using Array.map()
 * @param {Array<Object>} summaries
 * @param {"metric"|"imperial"} unit
 * @param {HTMLElement} container
 */
function renderForecastRows(summaries, unit, container) {
  if (!container) return;

  if (!Array.isArray(summaries) || summaries.length === 0) {
    container.innerHTML = `<p class="section-sub">Forecast data is currently unavailable for this location.</p>`;
    return;
  }

  // Compute global min/max across the 5 days to render proportional thermal range bars
  const globalMin = Math.min(...summaries.map((d) => d.minCelsius));
  const globalMax = Math.max(...summaries.map((d) => d.maxCelsius));
  const totalSpan = Math.max(globalMax - globalMin, 1);

  const unitChar = unit === "imperial" ? "°" : "°";

  const rowsMarkup = summaries
    .map((day) => {
      const minVal = convertTemperature(day.minCelsius, unit);
      const maxVal = convertTemperature(day.maxCelsius, unit);
      const leftPct = Math.max(0, Math.min(100, ((day.minCelsius - globalMin) / totalSpan) * 100));
      const widthPct = Math.max(8, Math.min(100 - leftPct, ((day.maxCelsius - day.minCelsius) / totalSpan) * 100));

      return `
        <article class="forecast-row" role="listitem" aria-label="${day.dayName}, ${day.dateLabel}: ${day.description}, low ${minVal}${unitChar}, high ${maxVal}${unitChar}">
          <div class="forecast-date-col">
            <span class="forecast-day">${day.dayName}</span>
            <span class="forecast-date">${day.dateLabel}</span>
          </div>

          <img
            src="${day.iconPath}"
            alt="${day.description}"
            class="forecast-icon"
            width="34"
            height="34"
            loading="lazy"
          />

          <span class="forecast-desc">${day.description}</span>

          <div class="forecast-range-col">
            <span class="forecast-min" title="Minimum temperature">${minVal}${unitChar}</span>
            <div class="temp-bar-track" aria-hidden="true">
              <div class="temp-bar-fill" style="left: ${leftPct.toFixed(1)}%; width: ${widthPct.toFixed(1)}%;"></div>
            </div>
            <span class="forecast-max" title="Maximum temperature">${maxVal}${unitChar}</span>
          </div>
        </article>
      `;
    })
    .join("");

  container.innerHTML = rowsMarkup;
}
