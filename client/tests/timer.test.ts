import { describe, it, expect } from 'vitest';

describe('Timer Math and Calculations', () => {
  it('calculates remaining seconds correctly from wall-clock target timestamp', () => {
    const now = 1000000;
    const target = now + 45 * 1000; // 45 seconds remaining
    const remaining = Math.max(0, Math.round((target - now) / 1000));
    expect(remaining).toBe(45);
  });

  it('prevents negative remaining seconds when elapsed past targetEnd', () => {
    const now = 2000000;
    const target = now - 15 * 1000; // already 15 seconds past
    const remaining = Math.max(0, Math.round((target - now) / 1000));
    expect(remaining).toBe(0);
  });

  it('formats MM:SS accurately', () => {
    const formatTime = (totalSeconds: number) => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    expect(formatTime(1800)).toBe('30:00');
    expect(formatTime(300)).toBe('05:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(9)).toBe('00:09');
    expect(formatTime(0)).toBe('00:00');
  });

  it('calculates radial progress percentages correctly', () => {
    const totalDuration = 1800; // 30 mins
    const remaining = 900; // 15 mins left
    const progressPercent = Math.min(100, Math.round(((totalDuration - remaining) / totalDuration) * 100));
    expect(progressPercent).toBe(50);
  });
});
