/**
 * ==============================================================================
 * VERCEL / SERVERLESS API PROXY (api/weather.js)
 * 
 * Keeps OPENWEATHER_API_KEY hidden on the server side in production.
 * Set `OPENWEATHER_API_KEY` in Vercel/Netlify environment variables and enable
 * `USE_SERVERLESS_PROXY: true` in `js/config.js`.
 * ==============================================================================
 */

const ALLOWED_ENDPOINTS = {
  weather: "https://api.openweathermap.org/data/2.5/weather",
  forecast: "https://api.openweathermap.org/data/2.5/forecast",
  air_pollution: "https://api.openweathermap.org/data/2.5/air_pollution",
  geo: "https://api.openweathermap.org/geo/1.0/direct",
  reverse: "https://api.openweathermap.org/geo/1.0/reverse"
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server weather configuration is missing OPENWEATHER_API_KEY."
    });
  }

  const { type, q, lat, lon, limit = "5", units = "metric" } = req.query;
  const targetUrl = ALLOWED_ENDPOINTS[type];

  if (!targetUrl) {
    return res.status(400).json({ error: "Invalid weather telemetry endpoint type." });
  }

  const params = new URLSearchParams({ appid: apiKey });

  if (type === "geo") {
    if (!q) return res.status(400).json({ error: "Missing city query 'q'." });
    params.append("q", String(q).trim());
    params.append("limit", String(limit));
  } else {
    if (lat !== undefined && lon !== undefined) {
      params.append("lat", String(lat));
      params.append("lon", String(lon));
    } else if (q && (type === "weather" || type === "forecast")) {
      params.append("q", String(q).trim());
    } else {
      return res.status(400).json({ error: "Missing geographic coordinates or city query." });
    }

    if (type === "weather" || type === "forecast") {
      params.append("units", units === "imperial" ? "imperial" : "metric");
    }
  }

  try {
    const upstreamResponse = await fetch(`${targetUrl}?${params.toString()}`);
    const payload = await upstreamResponse.json();

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(upstreamResponse.status).json(payload);
  } catch (err) {
    return res.status(502).json({
      error: "Failed to communicate with upstream weather service."
    });
  }
}
