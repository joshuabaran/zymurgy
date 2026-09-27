// Predicted FG from OG and yeast apparent attenuation: FG points = OG points × (1 − attenuation).
export function predictedFG(og: number, attenuationPercent: number): number {
  const ogPoints = (og - 1) * 1000;
  const fgPoints = ogPoints * (1 - attenuationPercent / 100);
  return Number((1 + fgPoints / 1000).toFixed(3));
}
