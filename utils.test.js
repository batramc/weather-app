const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { toDisplay, getWeatherInfo, formatDay, WMO_CODES } = require('./utils');

describe('toDisplay', () => {
  test('returns Celsius rounded when unit is C', () => {
    assert.equal(toDisplay(20, 'C'), 20);
    assert.equal(toDisplay(20.6, 'C'), 21);
    assert.equal(toDisplay(-5.4, 'C'), -5);
  });

  test('converts Celsius to Fahrenheit when unit is F', () => {
    assert.equal(toDisplay(0, 'F'), 32);
    assert.equal(toDisplay(100, 'F'), 212);
    assert.equal(toDisplay(-40, 'F'), -40); // same in both scales
    assert.equal(toDisplay(37, 'F'), 99);   // body temp
  });

  test('rounds to nearest integer', () => {
    assert.equal(toDisplay(0.4, 'C'), 0);
    assert.equal(toDisplay(0.5, 'C'), 1);
    assert.equal(toDisplay(0.4, 'F'), 33); // 0.4 * 9/5 + 32 = 32.72 -> 33
  });

  test('rounds negative halves toward zero', () => {
    // JS Math.round(-0.5) === 0 (rounds toward +Infinity)
    assert.equal(toDisplay(-0.5, 'C'), 0);
    assert.equal(toDisplay(-1.5, 'C'), -1);
  });

  test('handles zero', () => {
    assert.equal(toDisplay(0, 'C'), 0);
    assert.equal(toDisplay(0, 'F'), 32);
  });

  test('handles extreme temperatures', () => {
    assert.equal(toDisplay(-273.15, 'C'), -273);           // absolute zero
    assert.equal(toDisplay(-273.15, 'F'), -460);           // absolute zero in F: -459.67 -> -460
    assert.equal(toDisplay(5778, 'F'), 10432);             // surface of the sun
  });

  test('treats unknown unit as Celsius', () => {
    // unit is not 'F', so falls through to Celsius path
    assert.equal(toDisplay(25, 'X'), 25);
    assert.equal(toDisplay(25, ''),  25);
  });
});

describe('getWeatherInfo', () => {
  test('returns correct label and icon for known codes', () => {
    assert.deepEqual(getWeatherInfo(0),  { label: 'Clear Sky',    icon: '☀️' });
    assert.deepEqual(getWeatherInfo(3),  { label: 'Overcast',     icon: '☁️' });
    assert.deepEqual(getWeatherInfo(63), { label: 'Rain',         icon: '🌧️' });
    assert.deepEqual(getWeatherInfo(95), { label: 'Thunderstorm', icon: '⛈️' });
  });

  test('returns Unknown fallback for unrecognised codes', () => {
    assert.deepEqual(getWeatherInfo(999), { label: 'Unknown', icon: '🌡️' });
    assert.deepEqual(getWeatherInfo(-1),  { label: 'Unknown', icon: '🌡️' });
  });

  test('returns Unknown for gaps in the WMO code range', () => {
    // Officially undefined codes between known ranges
    for (const code of [4, 10, 44, 49, 56, 57, 58, 66, 67, 78, 79, 83, 84, 87, 97, 98]) {
      assert.deepEqual(
        getWeatherInfo(code),
        { label: 'Unknown', icon: '🌡️' },
        `expected Unknown for gap code ${code}`
      );
    }
  });

  test('returns Unknown for null and undefined', () => {
    assert.deepEqual(getWeatherInfo(null),      { label: 'Unknown', icon: '🌡️' });
    assert.deepEqual(getWeatherInfo(undefined), { label: 'Unknown', icon: '🌡️' });
  });

  test('returns Unknown for float codes', () => {
    assert.deepEqual(getWeatherInfo(0.5), { label: 'Unknown', icon: '🌡️' });
    assert.deepEqual(getWeatherInfo(63.0), { label: 'Rain', icon: '🌧️' }); // 63.0 === 63
  });

  test('accepts string codes via JS property coercion', () => {
    // Object keys are strings internally, so '0' and 0 resolve the same entry
    assert.deepEqual(getWeatherInfo('0'),  { label: 'Clear Sky', icon: '☀️' });
    assert.deepEqual(getWeatherInfo('95'), { label: 'Thunderstorm', icon: '⛈️' });
  });

  test('covers all precipitation and snow code families', () => {
    // Drizzle: 51, 53, 55
    assert.equal(getWeatherInfo(51).label, 'Light Drizzle');
    assert.equal(getWeatherInfo(53).label, 'Drizzle');
    assert.equal(getWeatherInfo(55).label, 'Heavy Drizzle');
    // Rain: 61, 63, 65
    assert.equal(getWeatherInfo(61).label, 'Light Rain');
    assert.equal(getWeatherInfo(65).label, 'Heavy Rain');
    // Snow: 71, 73, 75, 77
    assert.equal(getWeatherInfo(71).label, 'Light Snow');
    assert.equal(getWeatherInfo(73).label, 'Snow');
    assert.equal(getWeatherInfo(75).label, 'Heavy Snow');
    assert.equal(getWeatherInfo(77).label, 'Snow Grains');
    // Showers: 80, 81, 82
    assert.equal(getWeatherInfo(82).label, 'Heavy Showers');
    // Snow showers: 85, 86
    assert.equal(getWeatherInfo(85).label, 'Snow Showers');
    assert.equal(getWeatherInfo(86).label, 'Heavy Snow Showers');
    // Thunderstorm with hail: 96, 99
    assert.equal(getWeatherInfo(96).label, 'Thunderstorm w/ Hail');
    assert.equal(getWeatherInfo(99).label, 'Thunderstorm w/ Hail');
  });

  test('all WMO_CODES entries have a non-empty label and icon', () => {
    for (const [code, info] of Object.entries(WMO_CODES)) {
      assert.ok(typeof info.label === 'string' && info.label.length > 0, `code ${code} missing label`);
      assert.ok(typeof info.icon  === 'string' && info.icon.length  > 0, `code ${code} missing icon`);
    }
  });
});

describe('formatDay', () => {
  test('returns "Today" for index 0 regardless of date', () => {
    assert.equal(formatDay('2024-01-15', 0), 'Today');
    assert.equal(formatDay('2099-12-31', 0), 'Today');
  });

  test('returns abbreviated weekday name for index > 0', () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // 2024-01-15 is a Monday
    const result = formatDay('2024-01-15', 1);
    assert.ok(weekdays.includes(result), `Expected a weekday abbreviation, got "${result}"`);
    assert.equal(result, 'Mon');
  });

  test('returns different days for consecutive dates', () => {
    const day1 = formatDay('2024-01-15', 1); // Mon
    const day2 = formatDay('2024-01-16', 2); // Tue
    assert.notEqual(day1, day2);
  });

  test('covers all seven weekdays', () => {
    // Week of 2024-01-14 (Sun) through 2024-01-20 (Sat)
    const expected = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dates = [
      '2024-01-14', '2024-01-15', '2024-01-16',
      '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-20',
    ];
    dates.forEach((date, i) => {
      assert.equal(formatDay(date, 1), expected[i], `expected ${expected[i]} for ${date}`);
    });
  });

  test('index only controls Today vs weekday, not the day name', () => {
    // Same date, different non-zero indexes → same weekday
    assert.equal(formatDay('2024-01-15', 1), formatDay('2024-01-15', 5));
  });

  test('negative index returns weekday, not Today', () => {
    const result = formatDay('2024-01-15', -1);
    assert.notEqual(result, 'Today');
    assert.equal(result, 'Mon');
  });

  test('handles leap year date (Feb 29)', () => {
    // 2024-02-29 is a Thursday
    assert.equal(formatDay('2024-02-29', 1), 'Thu');
  });

  test('handles year-end boundary (Dec 31 / Jan 1)', () => {
    // 2024-12-31 is a Tuesday, 2025-01-01 is a Wednesday
    assert.equal(formatDay('2024-12-31', 1), 'Tue');
    assert.equal(formatDay('2025-01-01', 1), 'Wed');
  });
});
