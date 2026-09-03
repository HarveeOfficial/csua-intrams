export type MedalName = 'gold' | 'silver' | 'bronze' | 'none';

export const MEDAL_POINTS: Record<Exclude<MedalName, 'none'>, number> = {
  gold: 5,
  silver: 3,
  bronze: 1,
};

export function normalizeEventPoints(points: number, playerCount = 1): number {
  const safePlayerCount = Number.isFinite(playerCount) && playerCount > 0 ? playerCount : 1;
  if (points === 5 || points === 3 || points === 1) {
    return points * safePlayerCount;
  }
  if (points === 0) {
    return 0;
  }
  return points;
}

export function eventPointsForMedal(medalPoints: number, playerCount = 1): number {
  return normalizeEventPoints(medalPoints, playerCount);
}

export function medalFromEventPoints(points: number, playerCount = 1): MedalName {
  const safePlayerCount = Number.isFinite(playerCount) && playerCount > 0 ? playerCount : 1;
  const weightedPoints = normalizeEventPoints(points, safePlayerCount);
  if (weightedPoints <= 0) return 'none';
  const normalizedBase = weightedPoints / safePlayerCount;
  if (normalizedBase === 5) return 'gold';
  if (normalizedBase === 3) return 'silver';
  if (normalizedBase === 1) return 'bronze';
  return 'none';
}
