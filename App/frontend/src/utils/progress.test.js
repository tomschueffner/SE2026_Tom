import { describe, it, expect } from 'vitest';
import { avgProgress, progColor } from './progress.js';

// avgProgress: computes the mean of each topic's latest progress value.
// Topics with no progress entries are excluded from the average.
// Returns null if no topic has any progress recorded yet.
describe('avgProgress', () => {
  it('returns null for null input', () => {
    const input = null;
    const result = avgProgress(input);
    console.log('Input:', input, '| Expected: null | Actual:', result);
    expect(result).toBe(null);
  });

  it('returns null for empty array', () => {
    const input = [];
    const result = avgProgress(input);
    console.log('Input: [] | Expected: null | Actual:', result);
    expect(result).toBe(null);
  });

  it('returns null when no topic has a progress entry', () => {
    const input = [{ progress: [] }, { progress: [] }];
    const result = avgProgress(input);
    console.log('Input: 2 topics with empty progress | Expected: null | Actual:', result);
    expect(result).toBe(null);
  });

  it('skips topics without progress and averages the rest', () => {
    const input = [{ progress: [{ value: 60 }] }, { progress: [] }];
    const result = avgProgress(input);
    console.log('Input: topic[60], topic[] | Expected: 60 | Actual:', result);
    expect(result).toBe(60);
  });

  it('rounds 0.5 up to 1', () => {
    const input = [{ progress: [{ value: 0 }] }, { progress: [{ value: 1 }] }];
    const result = avgProgress(input);
    console.log('Input: topic[0], topic[1] → avg=0.5 | Expected: 1 | Actual:', result);
    expect(result).toBe(1);
  });

  it('averages multiple entries correctly', () => {
    const input = [{ progress: [{ value: 80 }] }, { progress: [{ value: 100 }] }];
    const result = avgProgress(input);
    console.log('Input: topic[80], topic[100] | Expected: 90 | Actual:', result);
    expect(result).toBe(90);
  });
});

// progColor: returns a CSS custom property string used for inline styles.
// Thresholds: < 50 → red, 50–79 → yellow, ≥ 80 → green, null/undefined → gray (fg3).
describe('progColor', () => {
  it('returns var(--fg3) for null', () => {
    const input = null;
    const result = progColor(input);
    console.log('Input:', input, '| Expected: var(--fg3) | Actual:', result);
    expect(result).toBe('var(--fg3)');
  });

  it('returns var(--fg3) for undefined', () => {
    const input = undefined;
    const result = progColor(input);
    console.log('Input:', input, '| Expected: var(--fg3) | Actual:', result);
    expect(result).toBe('var(--fg3)');
  });

  it('returns var(--red) for 0', () => {
    const input = 0;
    const result = progColor(input);
    console.log('Input:', input, '| Expected: var(--red) | Actual:', result);
    expect(result).toBe('var(--red)');
  });

  it('returns var(--red) for 49', () => {
    const input = 49;
    const result = progColor(input);
    console.log('Input:', input, '| Expected: var(--red) | Actual:', result);
    expect(result).toBe('var(--red)');
  });

  it('returns var(--yellow) for 50', () => {
    const input = 50;
    const result = progColor(input);
    console.log('Input:', input, '| Expected: var(--yellow) | Actual:', result);
    expect(result).toBe('var(--yellow)');
  });

  it('returns var(--yellow) for 79', () => {
    const input = 79;
    const result = progColor(input);
    console.log('Input:', input, '| Expected: var(--yellow) | Actual:', result);
    expect(result).toBe('var(--yellow)');
  });

  it('returns var(--green) for 80', () => {
    const input = 80;
    const result = progColor(input);
    console.log('Input:', input, '| Expected: var(--green) | Actual:', result);
    expect(result).toBe('var(--green)');
  });

  it('returns var(--green) for 100', () => {
    const input = 100;
    const result = progColor(input);
    console.log('Input:', input, '| Expected: var(--green) | Actual:', result);
    expect(result).toBe('var(--green)');
  });
});
