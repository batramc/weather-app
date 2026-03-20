const WMO_CODES = {
  0:  { label: 'Clear Sky',           icon: '☀️' },
  1:  { label: 'Mainly Clear',         icon: '🌤️' },
  2:  { label: 'Partly Cloudy',        icon: '⛅' },
  3:  { label: 'Overcast',             icon: '☁️' },
  45: { label: 'Foggy',                icon: '🌫️' },
  48: { label: 'Icy Fog',              icon: '🌫️' },
  51: { label: 'Light Drizzle',        icon: '🌦️' },
  53: { label: 'Drizzle',              icon: '🌦️' },
  55: { label: 'Heavy Drizzle',        icon: '🌧️' },
  61: { label: 'Light Rain',           icon: '🌧️' },
  63: { label: 'Rain',                 icon: '🌧️' },
  65: { label: 'Heavy Rain',           icon: '🌧️' },
  71: { label: 'Light Snow',           icon: '🌨️' },
  73: { label: 'Snow',                 icon: '❄️' },
  75: { label: 'Heavy Snow',           icon: '❄️' },
  77: { label: 'Snow Grains',          icon: '🌨️' },
  80: { label: 'Light Showers',        icon: '🌦️' },
  81: { label: 'Showers',              icon: '🌧️' },
  82: { label: 'Heavy Showers',        icon: '⛈️' },
  85: { label: 'Snow Showers',         icon: '🌨️' },
  86: { label: 'Heavy Snow Showers',   icon: '❄️' },
  95: { label: 'Thunderstorm',         icon: '⛈️' },
  96: { label: 'Thunderstorm w/ Hail', icon: '⛈️' },
  99: { label: 'Thunderstorm w/ Hail', icon: '⛈️' },
};

function getWeatherInfo(code, isDay = true) {
  if (!isDay && (code === 0 || code === 1)) {
    return { label: code === 0 ? 'Clear Sky' : 'Mainly Clear', icon: '🌙' };
  }
  return WMO_CODES[code] ?? { label: 'Unknown', icon: '🌡️' };
}

function toDisplay(tempC, unit) {
  // + 0 normalises -0 to 0 (Math.round(-0.5) === -0 in JS)
  if (unit === 'F') return Math.round(tempC * 9 / 5 + 32) + 0;
  return Math.round(tempC) + 0;
}

function formatDay(dateStr, index) {
  if (index === 0) return 'Today';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

module.exports = { getWeatherInfo, toDisplay, formatDay, WMO_CODES };
