import { describe, it, expect } from 'vitest';
import { progressColor, progressColorHex } from './progressColor.js';

// progressColor: returns a Tailwind CSS class for background color.
// Used on progress badges and bars throughout the UI.
// Thresholds: < 50 → red, 50–79 → yellow, ≥ 80 → green, null → gray.
describe('progressColor', () => {
  it('returns bg-gray-300 for null', () => {
    const input = null;
    const result = progressColor(input);
    console.log('Input:', input, '| Expected: bg-gray-300 | Actual:', result);
    expect(result).toBe('bg-gray-300');
  });

  it('returns bg-red-500 for 49', () => {
    const input = 49;
    const result = progressColor(input);
    console.log('Input:', input, '| Expected: bg-red-500 | Actual:', result);
    expect(result).toBe('bg-red-500');
  });

  it('returns bg-yellow-500 for 50', () => {
    const input = 50;
    const result = progressColor(input);
    console.log('Input:', input, '| Expected: bg-yellow-500 | Actual:', result);
    expect(result).toBe('bg-yellow-500');
  });

  it('returns bg-yellow-500 for 79', () => {
    const input = 79;
    const result = progressColor(input);
    console.log('Input:', input, '| Expected: bg-yellow-500 | Actual:', result);
    expect(result).toBe('bg-yellow-500');
  });

  it('returns bg-green-500 for 80', () => {
    const input = 80;
    const result = progressColor(input);
    console.log('Input:', input, '| Expected: bg-green-500 | Actual:', result);
    expect(result).toBe('bg-green-500');
  });

  it('returns bg-green-500 for 100', () => {
    const input = 100;
    const result = progressColor(input);
    console.log('Input:', input, '| Expected: bg-green-500 | Actual:', result);
    expect(result).toBe('bg-green-500');
  });
});

// progressColorHex: same thresholds as progressColor but returns hex strings.
// Used by Recharts components which require raw hex values instead of CSS classes.
describe('progressColorHex', () => {
  it('returns #d1d5db for null', () => {
    const input = null;
    const result = progressColorHex(input);
    console.log('Input:', input, '| Expected: #d1d5db | Actual:', result);
    expect(result).toBe('#d1d5db');
  });

  it('returns #ef4444 for 49', () => {
    const input = 49;
    const result = progressColorHex(input);
    console.log('Input:', input, '| Expected: #ef4444 | Actual:', result);
    expect(result).toBe('#ef4444');
  });

  it('returns #eab308 for 50', () => {
    const input = 50;
    const result = progressColorHex(input);
    console.log('Input:', input, '| Expected: #eab308 | Actual:', result);
    expect(result).toBe('#eab308');
  });

  it('returns #eab308 for 79', () => {
    const input = 79;
    const result = progressColorHex(input);
    console.log('Input:', input, '| Expected: #eab308 | Actual:', result);
    expect(result).toBe('#eab308');
  });

  it('returns #22c55e for 80', () => {
    const input = 80;
    const result = progressColorHex(input);
    console.log('Input:', input, '| Expected: #22c55e | Actual:', result);
    expect(result).toBe('#22c55e');
  });

  it('returns #22c55e for 100', () => {
    const input = 100;
    const result = progressColorHex(input);
    console.log('Input:', input, '| Expected: #22c55e | Actual:', result);
    expect(result).toBe('#22c55e');
  });
});
