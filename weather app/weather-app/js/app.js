/**
 * ==============================================================================
 * MERIDIAN CLIMATE TELEMETRY — APPLICATION CONTROLLER (js/app.js)
 * Datheon Full Stack Web Development Internship – Task 3
 *
 * Manages UI events, loading states, error recovery, theme switching,
 * temperature unit toggles, geolocation, and recent search persistence.
 * ==============================================================================
 */

(function () {
  "use strict";

  const state = {
    unit: CONFIG.DEFAULT_UNIT,
    themeMode: CONFIG.DEFAULT_THEME_MODE, // "auto" | "light"
    isLoading: false,
    requestToken: 0,
    lastValidWeather: null,
    lastValidForecast: [],
    recentCities: []
  };

  const DOM = {
    searchForm: document.getElementById("searchForm"),
    cityInput: document.getElementById("cityInput"),
    searchBtn: document.getElementById("searchBtn"),
    btnSpinner: document.getElementById("btnSpinner"),
    searchBtnLabel: document.getElementById("searchBtnLabel"),
    geoBtn: document.getElementById("geoBtn"),

    unitCelsiusBtn: document.getElementById("unitCelsiusBtn"),
    unitFahrenheitBtn: document.getElementById("unitFahrenheitBtn"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    openApiModalBtn: document.getElementById("openApiModalBtn"),

    recentRow: document.getElementById("recentRow"),
    recentList: document.getElementById("recentList"),
    clearRecentBtn: document.getElementById("clearRecentBtn"),

    apiSetupBanner: document.getElementById("apiSetupBanner"),
    bannerConfigureBtn: document.getElementById("bannerConfigureBtn"),
    errorBanner: document.getElementById("errorBanner"),
    errorMessage: document.getElementById("errorMessage"),
    dismissErrorBtn: document.getElementById("dismissErrorBtn"),
    loadingBar: document.getElementById("loadingBar"),
    loadingText: document.getElementById("loadingText"),

    emptyState: document.getElementById("emptyState"),
    dashboard: document.getElementById("dashboard"),

    // Hero
    cityName: document.getElementById("cityName"),
    countryBadge: document.getElementById("countryBadge"),
    regionLine: document.getElementById("regionLine"),
    localDateTime: document.getElementById("localDateTime"),
    currentTemp: document.getElementById("currentTemp"),
    currentUnit: document.getElementById("currentUnit"),
    feelsLikeTemp: document.getElementById("feelsLikeTemp"),
    tempHigh: document.getElementById("tempHigh"),
    tempLow: document.getElementById("tempLow"),
    weatherIcon: document.getElementById("weatherIcon"),
    weatherMain: document.getElementById("weatherMain"),
    weatherDescription: document.getElementById("weatherDescription"),

    // Metrics
    metricHumidity: document.getElementById("metricHumidity"),
    metricHumidityNote: document.getElementById("metricHumidityNote"),
    metricWind: document.getElementById("metricWind"),
    metricWindDir: document.getElementById("metricWindDir"),
    metricPressure: document.getElementById("metricPressure"),
    metricPressureNote: document.getElementById("metricPressureNote"),
    metricVisibility: document.getElementById("metricVisibility"),
    metricVisibilityNote: document.getElementById("metricVisibilityNote"),
    metricClouds: document.getElementById("metricClouds"),
    metricCloudsNote: document.getElementById("metricCloudsNote"),
    metricSunrise: document.getElementById("metricSunrise"),
    metricSunset: document.getElementById("metricSunset"),

    // Forecast & Additional
    forecastDaysCount: document.getElementById("forecastDaysCount"),
    forecastList: document.getElementById("forecastList"),
    daylightDuration: document.getElementById("daylightDuration"),
    detailSunrise: document.getElementById("detailSunrise"),
    detailSunset: document.getElementById("detailSunset"),
    aqiBadge: document.getElementById("aqiBadge"),
    aqiRating: document.getElementById("aqiRating"),
    aqiPm25: document.getElementById("aqiPm25"),
    utcOffsetBadge: document.getElementById("utcOffsetBadge"),
    coordDisplay: document.getElementById("coordDisplay"),
    lastUpdated: document.getElementById("lastUpdated"),

    // API Modal
    apiModal: document.getElementById("apiModal"),
    closeApiModalBtn: document.getElementById("closeApiModalBtn"),
    apiKeyInput: document.getElementById("apiKeyInput"),
    saveApiKeyBtn: document.getElementById("saveApiKeyBtn"),
    clearApiKeyBtn: document.getElementById("clearApiKeyBtn")
  };

  /* ==========================================================================
     1. INITIALIZATION & STORAGE
     ========================================================================== */
  function init() {
    restorePreferences();
    bindEvents();
    renderRecentCities();
    applyVisualTheme();

    if (!hasTelemetryCredentials()) {
      DOM.apiSetupBanner.hidden = false;
      DOM.emptyState.hidden = false;
      DOM.dashboard.hidden = true;
      return;
    }

    DOM.apiSetupBanner.hidden = true;
    const savedCity = readStorage(CONFIG.STORAGE_KEYS.LAST_CITY);
    loadWeatherForCity(savedCity || CONFIG.DEFAULT_CITY);
  }

  function restorePreferences() {
    const savedUnit = readStorage(CONFIG.STORAGE_KEYS.UNIT_PREFERENCE);
    if (savedUnit === "metric" || savedUnit === "imperial") {
      state.unit = savedUnit;
    }
    updateUnitButtons();

    const savedTheme = readStorage(CONFIG.STORAGE_KEYS.THEME_MODE);
    if (savedTheme === "auto" || savedTheme === "light") {
      state.themeMode = savedTheme;
    }

    try {
      const rawRecent = localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_CITIES);
      if (rawRecent) {
        const parsed = JSON.parse(rawRecent);
        if (Array.isArray(parsed)) {
          state.recentCities = parsed.filter((c) => typeof c === "string" && c.trim().length > 0);
        }
      }
    } catch (e) {
      state.recentCities = [];
    }

    const storedKey = readStorage(CONFIG.STORAGE_KEYS.USER_API_KEY);
    if (storedKey && DOM.apiKeyInput) {
      DOM.apiKeyInput.value = storedKey;
    }
  }

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Ignore storage quota / privacy restrictions
    }
  }

  /* ==========================================================================
     2. EVENT BINDING
     ========================================================================== */
  function bindEvents() {
    DOM.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = (DOM.cityInput.value || "").trim();
      if (!query) {
        showError("Please enter a city name before searching.");
        DOM.cityInput.focus();
        return;
      }
      loadWeatherForCity(query);
    });

    DOM.geoBtn.addEventListener("click", handleCurrentLocation);

    DOM.unitCelsiusBtn.addEventListener("click", () => handleUnitChange("metric"));
    DOM.unitFahrenheitBtn.addEventListener("click", () => handleUnitChange("imperial"));

    DOM.themeToggleBtn.addEventListener("click", () => {
      state.themeMode = state.themeMode === "light" ? "auto" : "light";
      writeStorage(CONFIG.STORAGE_KEYS.THEME_MODE, state.themeMode);
      applyVisualTheme();
    });

    DOM.dismissErrorBtn.addEventListener("click", clearError);
    DOM.clearRecentBtn.addEventListener("click", clearRecentCities);

    // API Key Configuration Modal
    DOM.openApiModalBtn.addEventListener("click", openApiModal);
    DOM.bannerConfigureBtn.addEventListener("click", openApiModal);
    DOM.closeApiModalBtn.addEventListener("click", () => DOM.apiModal.close());
    DOM.apiModal.addEventListener("click", (e) => {
      if (e.target === DOM.apiModal) DOM.apiModal.close();
    });
    DOM.apiKeyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        DOM.saveApiKeyBtn.click();
      }
    });

    DOM.saveApiKeyBtn.addEventListener("click", () => {
      const key = (DOM.apiKeyInput.value || "").trim();
      if (!key) {
        showError("Please paste a valid OpenWeatherMap API key.");
        return;
      }
      writeStorage(CONFIG.STORAGE_KEYS.USER_API_KEY, key);
      DOM.apiSetupBanner.hidden = true;
      DOM.apiModal.close();
      clearError();

      const cityToLoad =
        (state.lastValidWeather && state.lastValidWeather.city) ||
        readStorage(CONFIG.STORAGE_KEYS.LAST_CITY) ||
        CONFIG.DEFAULT_CITY;
      loadWeatherForCity(cityToLoad);
    });

    DOM.clearApiKeyBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_API_KEY);
      } catch (e) {}
      DOM.apiKeyInput.value = "";
      if (!hasTelemetryCredentials()) {
        DOM.apiSetupBanner.hidden = false;
      }
      DOM.apiModal.close();
    });

    window.addEventListener("offline", () => {
      showError("Internet connection lost. Reconnect to fetch updated weather telemetry.");
    });

    window.addEventListener("online", () => {
      clearError();
    });
  }

  function openApiModal() {
    const saved = readStorage(CONFIG.STORAGE_KEYS.USER_API_KEY);
    if (saved) DOM.apiKeyInput.value = saved;
    DOM.apiModal.showModal();
  }

  /* ==========================================================================
     3. ASYNCHRONOUS WEATHER FETCHING & RACE CONDITION PROTECTION
     ========================================================================== */
  async function loadWeatherForCity(cityQuery) {
    if (!hasTelemetryCredentials()) {
      DOM.apiSetupBanner.hidden = false;
      showError("Please configure your OpenWeatherMap API key to search live weather.");
      openApiModal();
      return;
    }

    const token = ++state.requestToken;
    clearError();
    setLoading(true, `Searching weather telemetry for "${cityQuery}"...`);

    try {
      const payload = await retrieveWeatherByCity(cityQuery);

      // Ignore stale responses if a newer search started while waiting
      if (token !== state.requestToken) return;

      const currentModel = processCurrentWeather(payload.location, payload.current, payload.airQuality);
      const forecastModels = processForecastData(payload.forecast);

      state.lastValidWeather = currentModel;
      state.lastValidForecast = forecastModels;

      renderDashboard();
      recordRecentCity(currentModel.city);
      writeStorage(CONFIG.STORAGE_KEYS.LAST_CITY, currentModel.city);
    } catch (err) {
      if (err.code === "ABORTED" || token !== state.requestToken) {
        return;
      }
      // Preserve last valid weather display while showing the clear error
      showError(err.message || "Unable to retrieve weather telemetry.");
      if (err.code === "MISSING_API_KEY" || err.code === "INVALID_API_KEY") {
        DOM.apiSetupBanner.hidden = false;
      }
    } finally {
      if (token === state.requestToken) {
        setLoading(false);
      }
    }
  }

  function handleCurrentLocation() {
    if (!hasTelemetryCredentials()) {
      DOM.apiSetupBanner.hidden = false;
      showError("Please configure your OpenWeatherMap API key first.");
      openApiModal();
      return;
    }

    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }

    clearError();
    setLoading(true, "Requesting device location permission...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const token = ++state.requestToken;
        setLoading(true, "Retrieving local atmospheric telemetry...");

        try {
          const payload = await retrieveWeatherByCoordinates(
            pos.coords.latitude,
            pos.coords.longitude
          );
          if (token !== state.requestToken) return;

          const currentModel = processCurrentWeather(payload.location, payload.current, payload.airQuality);
          const forecastModels = processForecastData(payload.forecast);

          state.lastValidWeather = currentModel;
          state.lastValidForecast = forecastModels;

          renderDashboard();
          recordRecentCity(currentModel.city);
          writeStorage(CONFIG.STORAGE_KEYS.LAST_CITY, currentModel.city);
        } catch (err) {
          if (err.code === "ABORTED" || token !== state.requestToken) return;
          showError(err.message || "Failed to fetch weather for your current location.");
        } finally {
          if (token === state.requestToken) {
            setLoading(false);
          }
        }
      },
      (geoErr) => {
        setLoading(false);
        let msg = "Unable to detect your location.";
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          msg = "Location permission was denied. Please search for a city manually.";
        } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
          msg = "Device location signal is currently unavailable.";
        } else if (geoErr.code === geoErr.TIMEOUT) {
          msg = "Location lookup timed out. Please try searching by city name.";
        }
        showError(msg);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  /* ==========================================================================
     4. DASHBOARD RENDERING
     ========================================================================== */
  function renderDashboard() {
    const w = state.lastValidWeather;
    if (!w) return;

    DOM.emptyState.hidden = true;
    DOM.dashboard.hidden = false;
    DOM.apiSetupBanner.hidden = true;

    const unitChar = state.unit === "imperial" ? "°F" : "°C";

    // Hero
    DOM.cityName.textContent = w.city;
    DOM.countryBadge.textContent = w.country;
    const hasCoords = typeof w.lat === "number" && typeof w.lon === "number";
    DOM.regionLine.textContent = w.state
      ? `${w.state}, ${w.country}`
      : hasCoords
        ? `Geographic Coordinates ${w.lat.toFixed(2)}°, ${w.lon.toFixed(2)}°`
        : w.country;
    DOM.localDateTime.textContent = `Local time · ${w.localDateTime}`;

    const tempVal = convertTemperature(w.tempCelsius, state.unit);
    const feelsVal = convertTemperature(w.feelsLikeCelsius, state.unit);
    const highVal = convertTemperature(w.tempMaxCelsius, state.unit);
    const lowVal = convertTemperature(w.tempMinCelsius, state.unit);

    DOM.currentTemp.textContent = tempVal !== null ? tempVal : "—";
    DOM.currentUnit.textContent = unitChar;
    DOM.feelsLikeTemp.textContent = feelsVal !== null ? `${feelsVal}${unitChar}` : "—";
    DOM.tempHigh.textContent = highVal !== null ? `${highVal}${unitChar}` : "—";
    DOM.tempLow.textContent = lowVal !== null ? `${lowVal}${unitChar}` : "—";

    DOM.weatherIcon.src = w.iconPath;
    DOM.weatherIcon.alt = `${w.weatherDescription} icon`;
    DOM.weatherMain.textContent = w.weatherMain;
    DOM.weatherDescription.textContent = w.weatherDescription;

    // Metrics
    DOM.metricHumidity.textContent = w.humidity !== null ? `${w.humidity}%` : "—";
    DOM.metricHumidityNote.textContent = describeHumidity(w.humidity);

    DOM.metricWind.textContent = formatWindSpeed(w.windSpeedMs, state.unit);
    DOM.metricWindDir.textContent = w.windDeg !== null ? `From ${getCompassDirection(w.windDeg)} (${w.windDeg}°)` : "Direction unavailable";

    DOM.metricPressure.textContent = w.pressure !== null ? `${w.pressure} hPa` : "—";
    DOM.metricPressureNote.textContent = describePressure(w.pressure);

    DOM.metricVisibility.textContent = formatVisibility(w.visibilityMeters, state.unit);
    DOM.metricVisibilityNote.textContent =
      w.visibilityMeters === null
        ? "Not reported"
        : w.visibilityMeters >= 10000
          ? "Unobstructed sight"
          : "Reduced visibility";

    DOM.metricClouds.textContent = w.cloudCover !== null ? `${w.cloudCover}%` : "—";
    DOM.metricCloudsNote.textContent = describeClouds(w.cloudCover);

    DOM.metricSunrise.textContent = w.sunriseText;
    DOM.metricSunset.textContent = w.sunsetText;

    // 5-Day Forecast (via Array.map in weather.js)
    renderForecastRows(state.lastValidForecast, state.unit, DOM.forecastList);
    DOM.forecastDaysCount.textContent = `${state.lastValidForecast.length} Days`;

    // Additional Info
    DOM.daylightDuration.textContent = w.daylightDuration;
    DOM.detailSunrise.textContent = w.sunriseText;
    DOM.detailSunset.textContent = w.sunsetText;

    if (w.aqi) {
      DOM.aqiBadge.textContent = `Index ${w.aqi.index}/5`;
      DOM.aqiRating.textContent = w.aqi.label;
      DOM.aqiPm25.textContent = w.aqi.pm25;
    } else {
      DOM.aqiBadge.textContent = "Unavailable";
      DOM.aqiRating.textContent = "Not reported";
      DOM.aqiPm25.textContent = "—";
    }

    DOM.utcOffsetBadge.textContent = w.utcOffsetLabel;
    DOM.coordDisplay.textContent =
      typeof w.lat === "number" && typeof w.lon === "number"
        ? `${w.lat.toFixed(3)}, ${w.lon.toFixed(3)}`
        : "—";

    const obsDate = new Date(w.observedTimestamp * 1000);
    DOM.lastUpdated.textContent = obsDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    applyVisualTheme();
  }

  /* ==========================================================================
     5. THEME, UNITS & RECENT SEARCHES
     ========================================================================== */
  function applyVisualTheme() {
    document.body.classList.remove(
      "atmosphere-clear-day",
      "atmosphere-cloudy",
      "atmosphere-rainy",
      "atmosphere-night",
      "theme-light"
    );

    if (state.themeMode === "light") {
      document.body.classList.add("theme-light");
      DOM.themeToggleBtn.setAttribute("aria-pressed", "true");
      return;
    }

    DOM.themeToggleBtn.setAttribute("aria-pressed", "false");
    const atmosphere =
      (state.lastValidWeather && state.lastValidWeather.atmosphereClass) ||
      "atmosphere-clear-day";
    document.body.classList.add(atmosphere);
  }

  function handleUnitChange(newUnit) {
    if (state.unit === newUnit) return;
    state.unit = newUnit;
    writeStorage(CONFIG.STORAGE_KEYS.UNIT_PREFERENCE, newUnit);
    updateUnitButtons();
    if (state.lastValidWeather) {
      renderDashboard();
    }
  }

  function updateUnitButtons() {
    const isMetric = state.unit === "metric";
    DOM.unitCelsiusBtn.classList.toggle("active", isMetric);
    DOM.unitCelsiusBtn.setAttribute("aria-checked", String(isMetric));
    DOM.unitFahrenheitBtn.classList.toggle("active", !isMetric);
    DOM.unitFahrenheitBtn.setAttribute("aria-checked", String(!isMetric));
  }

  function recordRecentCity(city) {
    if (!city) return;
    const clean = city.trim();
    state.recentCities = state.recentCities.filter(
      (c) => c.toLowerCase() !== clean.toLowerCase()
    );
    state.recentCities.unshift(clean);
    state.recentCities = state.recentCities.slice(0, CONFIG.MAX_RECENT_CITIES || 5);

    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT_CITIES, JSON.stringify(state.recentCities));
    } catch (e) {}

    renderRecentCities();
  }

  function renderRecentCities() {
    if (state.recentCities.length === 0) {
      DOM.recentRow.hidden = true;
      DOM.recentList.innerHTML = "";
      return;
    }

    DOM.recentRow.hidden = false;
    DOM.recentList.innerHTML = state.recentCities
      .map(
        (city) => `
          <button type="button" class="recent-chip" data-city="${escapeHtml(city)}" role="listitem">
            ${escapeHtml(city)}
          </button>
        `
      )
      .join("");

    DOM.recentList.querySelectorAll(".recent-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const city = chip.getAttribute("data-city");
        if (city) {
          DOM.cityInput.value = city;
          loadWeatherForCity(city);
        }
      });
    });
  }

  function clearRecentCities() {
    state.recentCities = [];
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.RECENT_CITIES);
    } catch (e) {}
    renderRecentCities();
  }

  /* ==========================================================================
     6. LOADING & ERROR STATE HELPERS
     ========================================================================== */
  function setLoading(isLoading, statusLabel = "Retrieving live meteorological telemetry...") {
    state.isLoading = isLoading;
    DOM.searchBtn.disabled = isLoading;
    DOM.geoBtn.disabled = isLoading;
    DOM.btnSpinner.hidden = !isLoading;
    DOM.searchBtnLabel.textContent = isLoading ? "Loading" : "Search";
    DOM.loadingBar.hidden = !isLoading;
    DOM.loadingText.textContent = statusLabel;
  }

  function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.errorBanner.hidden = false;
  }

  function clearError() {
    DOM.errorBanner.hidden = true;
  }

  /* ==========================================================================
     7. DESCRIPTIVE TELEMETRY HELPERS
     ========================================================================== */
  function describeHumidity(h) {
    if (typeof h !== "number") return "Relative moisture";
    if (h < 30) return "Dry air";
    if (h <= 60) return "Comfortable range";
    if (h <= 80) return "Humid";
    return "Very humid";
  }

  function describePressure(p) {
    if (typeof p !== "number") return "Barometric";
    if (p < 1005) return "Low pressure system";
    if (p > 1020) return "High pressure system";
    return "Steady sea-level";
  }

  function describeClouds(c) {
    if (typeof c !== "number") return "Sky obscuration";
    if (c < 15) return "Clear sky";
    if (c < 50) return "Scattered clouds";
    if (c < 85) return "Broken overcast";
    return "Full cloud cover";
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
