import { describe, it, expect } from 'vitest';

describe('Client Formatting and Category Helpers', () => {
  it('correctly maps internal category keys to user-facing labels', () => {
    const getCategoryLabel = (cat: string) => {
      switch (cat) {
        case 'neck_shoulder':
          return 'Neck & Shoulders';
        case 'wrist_hand':
          return 'Wrists & Hands';
        case 'chest_upper_body':
          return 'Chest & Upper Body';
        case 'seated_mobility':
          return 'Seated Mobility';
        case 'leg_ankle':
          return 'Legs & Ankles';
        case 'standing_breaks':
          return 'Standing Movement';
        default:
          return cat;
      }
    };

    expect(getCategoryLabel('neck_shoulder')).toBe('Neck & Shoulders');
    expect(getCategoryLabel('wrist_hand')).toBe('Wrists & Hands');
    expect(getCategoryLabel('chest_upper_body')).toBe('Chest & Upper Body');
  });

  it('calculates level spans properly', () => {
    const getLevel = (points: number) => {
      if (points < 100) return { level: 1, name: 'Posture Novice' };
      if (points < 250) return { level: 2, name: 'Ergonomic Explorer' };
      if (points < 500) return { level: 3, name: 'Desk Mover' };
      return { level: 4, name: 'Spine Guardian' };
    };

    expect(getLevel(0).level).toBe(1);
    expect(getLevel(99).level).toBe(1);
    expect(getLevel(100).level).toBe(2);
    expect(getLevel(250).level).toBe(3);
    expect(getLevel(500).level).toBe(4);
  });
});
