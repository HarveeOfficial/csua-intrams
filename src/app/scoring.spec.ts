import { eventPointsForMedal, medalFromEventPoints, normalizeEventPoints } from './scoring';

describe('scoring utilities', () => {
  it('multiplies medal value by player count', () => {
    expect(eventPointsForMedal(5, 11)).toBe(55);
    expect(eventPointsForMedal(3, 7)).toBe(21);
    expect(eventPointsForMedal(1, 4)).toBe(4);
  });

  it('accepts both raw medal values and already-weighted totals', () => {
    expect(normalizeEventPoints(5, 11)).toBe(55);
    expect(normalizeEventPoints(55, 11)).toBe(55);
    expect(medalFromEventPoints(55, 11)).toBe('gold');
    expect(medalFromEventPoints(0, 11)).toBe('none');
  });
});
