# Weather App

A single-file weather app built with React. No build step, no API key required.

## Features

- Search weather by city name
- Use your current location (browser geolocation)
- Current conditions: temperature, feels like, humidity, wind speed, high/low
- 5-day forecast
- °C / °F toggle
- Dark / light mode toggle

## Usage

Open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
```

## Data Sources

- **Weather:** [Open-Meteo](https://open-meteo.com/) — free, no API key
- **Geocoding (city search):** [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- **Reverse geocoding (geolocation):** [Nominatim](https://nominatim.openstreetmap.org/) (OpenStreetMap)

## Tests

Pure utility functions are extracted to `utils.js` and tested with Node's built-in test runner — no dependencies needed.

```bash
npm test
```

23 tests across 3 suites: `toDisplay`, `getWeatherInfo`, `formatDay`.
