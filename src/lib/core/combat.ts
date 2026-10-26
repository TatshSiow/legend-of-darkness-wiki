export interface CriticalInput { rating: number; roleLevel: number; paragonLevel: number; bonus: number; resistance: number }
export function criticalChance(input: CriticalInput): number | null {
  const { rating, roleLevel, paragonLevel, bonus, resistance } = input;
  if (!Object.values(input).every(Number.isFinite) || rating < 0 || roleLevel < 1 || paragonLevel < 0 || resistance < 0 || resistance > 100) return null;
  const effectiveLevel = roleLevel + Math.floor(paragonLevel / 20) + 1;
  const base = Math.trunc(100 * rating / (136.6 * effectiveLevel));
  const threshold = Math.trunc((base + bonus) * (1 - resistance / 100));
  return Math.max(0, Math.min(101, threshold)) / 101 * 100;
}
