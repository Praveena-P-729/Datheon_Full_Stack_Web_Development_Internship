# Meridian — Real-Time Weather Forecast & Climate Telemetry Application

> **Internship Project:** Datheon Full Stack Web Development Internship – Task 3  
> **Developer:** Praveena P.  
> **Tech Stack:** HTML5, CSS3 (Grid & Flexbox), Vanilla JavaScript (ES6+), OpenWeatherMap REST API  
> **Live Application URL:** *Pending Vercel/Netlify deployment (see Deployment section below)*

---

## 1. Project Introduction

**Meridian** is an editorial-style, responsive **Real-Time Weather Forecast & Climate Telemetry Application** built with semantic HTML5, modern CSS3, and modular ES6+ JavaScript. Designed around strong typographic hierarchy, hairline borders, generous whitespace, and weather-adaptive atmospheric color palettes, Meridian connects asynchronously to OpenWeatherMap REST APIs to deliver real-time meteorological observations, air quality telemetry, and an aggregated 5-day forecast for any city worldwide.

---

## 2. Core Features

* **Global City Search & Geocoding:** Searches cities worldwide via OpenWeatherMap Direct Geocoding (`geo/1.0/direct`) with whitespace trimming, Enter-key submission, and duplicate/empty validation.
* **Current Location Detection:** Uses the browser Geolocation API paired with Reverse Geocoding (`geo/1.0/reverse`) to retrieve weather at the user's coordinates, with explicit permission-denied handling.
* **Current Weather Hero:** Displays city, country, state/region, city-local date and time, focal current temperature, feels-like temperature, daily high/low, condition description, and dynamic SVG icons.
* **7-Metric Atmospheric Grid:** Humidity (%), Wind speed & compass heading, Barometric pressure (hPa), Visibility (km/mi), Cloud coverage (%), Sunrise, and Sunset (computed in the city's local timezone).
* **5-Day Weather Forecast:** Groups OpenWeatherMap's 3-hour forecast intervals by calendar date in the city's local timezone, computes true daily min/max extremes, selects representative midday weather, and renders rows dynamically with `Array.map()` and proportional temperature range bars.
* **Air Quality & Solar Cycle Details:** Integrates OpenWeatherMap's Air Pollution API (`air_pollution`) for AQI rating (1–5) and PM2.5 concentration, alongside daylight duration and UTC station metadata.
* **Atmospheric Color System & Light Theme:** Transitions smoothly between Clear Day (`#172B3A`), Cloudy (`#303C48`), Rainy (`#172B43`), Night (`#101827`), and an editorial Light Theme (`#F3F1EB`).
* **Non-Mutating Unit Switching (°C / °F):** Switches temperature, wind speed (`km/h` ↔ `mph`), and visibility (`km` ↔ `mi`) instantly from cached telemetry without re-fetching.
* **Resilient Error Handling & Race-Condition Protection:** Uses `AbortController` and request tokens so rapid consecutive searches cancel stale requests and preserve the last valid weather display if a subsequent search fails.

---

## 3. Technologies Used

* **Frontend:** Semantic HTML5, CSS3 (Custom Properties, Flexbox, CSS Grid, Media Queries), JavaScript ES6+
* **Networking:** Fetch API, `async/await`, `Promise.all()`, `AbortController`
* **APIs:** OpenWeatherMap Geocoding API, Current Weather API, 5-Day / 3-Hour Forecast API, Air Pollution API
* **Graphics:** Custom monochrome/duotone SVG weather & telemetry icons
* **Persistence:** `localStorage` for unit preference, theme mode, recent cities, and optional local browser API key
* **Serverless Proxy (Optional Production):** Vercel Serverless Function (`api/weather.js`)

---

## 4. API Integration Details

Meridian uses four official OpenWeatherMap endpoints inside [`js/api.js`](js/api.js):

1. **Direct Geocoding:** `https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={KEY}`
2. **Current Weather:** `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={KEY}`
3. **5-Day / 3-Hour Forecast:** `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=metric&appid={KEY}`
4. **Air Pollution (AQI):** `https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={KEY}`

### Why 5-Day Forecast Uses Aggregation
OpenWeatherMap's free tier `/data/2.5/forecast` endpoint returns **40 three-hour intervals** across 5 days rather than pre-computed daily summaries. [`js/weather.js`](js/weather.js) groups entries by the target city's calendar date (`timezone` offset), computes the actual minimum and maximum temperatures across each day's intervals, picks the midday interval (11:00–15:00 local time) as the representative condition, and generates the UI rows using `Array.map()`.

---

## 5. Folder Structure

```text
weather-app/
├── index.html               # Semantic HTML5 layout & accessible modal
├── README.md                # Documentation, setup, testing & deployment
├── LICENSE                  # MIT License
├── .gitignore               # Ignores .env, local overrides & OS artifacts
├── api/
│   └── weather.js           # Optional Vercel serverless proxy for secret API key protection
├── css/
│   └── style.css            # Editorial CSS3 design system, themes & responsive queries
├── js/
│   ├── config.js            # Endpoints, timeouts & storage keys (no hardcoded secrets)
│   ├── api.js               # Async fetch client, AbortController & HTTP status mapping
│   ├── weather.js           # Data normalization, 5-day grouping & Array.map() renderer
│   └── app.js               # UI state controller, unit toggle, theme & event handlers
├── assets/
│   ├── icons/               # Original SVG logo, weather icons & metric icons
│   └── images/              # Atmospheric horizon contour SVG
└── screenshots/             # Visual verification captures
```

---

## 6. Installation & API Key Setup

### Step 1: Register for an OpenWeatherMap API Key
1. Create a free account at [OpenWeatherMap Sign Up](https://home.openweathermap.org/users/sign_up).
2. Open the **API Keys** tab in your account dashboard and copy your key.
3. Wait 10–20 minutes after account creation for new keys to activate across OpenWeatherMap servers.

### Step 2: Run Locally
No build tools or package installations are required:

```bash
cd weather-app
python -m http.server 8000
```
Open `http://localhost:8000` in your browser.

### Step 3: Configure Your API Key Securely
* **Option A (In-Browser Setup):** Click **Enter API Key** in the application header/banner and paste your key. It is saved only in your own browser's `localStorage`.
* **Option B (Local `js/config.js`):** Paste your key into `CONFIG.API_KEY` in `js/config.js` during local testing (remember to clear it before pushing to a public GitHub repo).

### Security Note (Static vs. Production)
In a purely static frontend hosted on GitHub Pages or static hosting, any API key used directly by browser `fetch()` requests is visible in the browser's Network inspector. For production deployments where the API key must remain private, this repository includes [`api/weather.js`](api/weather.js). Configure `OPENWEATHER_API_KEY` as a server environment variable on Vercel and set `USE_SERVERLESS_PROXY: true` in `js/config.js`.

---

## 7. Testing Checklist

Before deploying, verify the following scenarios with a valid activated OpenWeatherMap API key:

1. **Global Cities:** Search `Coimbatore`, `Chennai`, `London`, and `Tokyo` — verify city local time, atmospheric theme shift, current metrics, AQI, and 5-day forecast.
2. **Invalid City:** Search `InvalidCityXYZ123` — confirm error banner appears while the last valid weather view remains intact.
3. **Empty Input:** Submit an empty search — verify polite validation error without browser `alert()`.
4. **Offline / Network Error:** Disable network in DevTools and search — verify network error message and loading spinner cleanup.
5. **Unit Switching:** Toggle `°C` / `°F` — verify current temperature, feels-like, highs/lows, wind (`km/h` ↔ `mph`), visibility (`km` ↔ `mi`), and 5-day forecast update immediately.
6. **Current Location:** Click **Location** button — test both Allow (coordinates resolved) and Deny (clear error message).
7. **Responsive Viewports:** Inspect at `320px`, `375px`, `425px`, `768px`, `1024px`, and `1440px` with zero horizontal overflow.
8. **Console Check:** Confirm zero uncaught JavaScript errors or broken asset requests.

---

## 8. Screenshots

Place desktop and mobile verification screenshots inside `screenshots/` after running with a live API key:
* `screenshots/desktop-clear.png`
* `screenshots/desktop-light-theme.png`
* `screenshots/mobile-responsive.png`

---

## 9. Deployment (Vercel or Netlify)

### Deploying on Vercel (Recommended with Serverless Proxy)
1. Push the repository to GitHub (ensure `js/config.js` has `API_KEY: ""`).
2. Import the repository in [Vercel](https://vercel.com/) and set the **Root Directory** to `weather-app`.
3. Under **Environment Variables**, add `OPENWEATHER_API_KEY` with your OpenWeatherMap key.
4. Set `USE_SERVERLESS_PROXY: true` in `js/config.js` so browser requests route securely through `/api/weather`.
5. Deploy and verify the generated `.vercel.app` URL.

### Deploying on Netlify (Static Mode)
1. Import the repository in [Netlify](https://www.netlify.com/).
2. Set **Base directory** and **Publish directory** to `weather-app`.
3. Deploy and configure your key in the UI dialog (or adapt `api/weather.js` to a Netlify Function).

---

## 10. Attribution & License

* Meteorological, forecast, geocoding, and air pollution data provided by [OpenWeatherMap](https://openweathermap.org/api).
* Released under the [MIT License](LICENSE).
