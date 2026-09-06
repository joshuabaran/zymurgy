// Points / PPG method (brewledger docs/02-calculations.md section 2).
// BeerJSON yield.fineGrind / potential: PPG ≈ yield% / 100 * 46 (sucrose).
export const SUCROSE_PPG = 46;

export type PredictedOGFermentable = {
  amountLb: number;
  ppg?: number;
  extractPercent?: number;
  // Late boil sugars/adjuncts: counted at 100% efficiency. Mash/steep grains use efficiencyPercent.
  lateAddition?: boolean;
};

export function extractPercentToPPG(extractPercent: number): number {
  return Number(((extractPercent / 100) * SUCROSE_PPG).toFixed(1));
}

export function fermentablePoints(amountLb: number, ppg: number): number {
  return amountLb * ppg;
}

export function predictedOG(
  fermentables: readonly PredictedOGFermentable[],
  efficiencyPercent: number,
  batchGal: number
): number {
  if (batchGal === 0) {
    return 1;
  }

  let mashPoints = 0;
  let lateSugarPoints = 0;

  for (const fermentable of fermentables) {
    const ppg = fermentable.ppg !== undefined
      ? fermentable.ppg
      : extractPercentToPPG(fermentable.extractPercent ?? 0);
    const points = fermentablePoints(fermentable.amountLb, ppg);
    if (fermentable.lateAddition) {
      lateSugarPoints += points;
    } else {
      mashPoints += points;
    }
  }

  const ogPoints = (mashPoints * (efficiencyPercent / 100) + lateSugarPoints) / batchGal;
  return Number((1 + ogPoints / 1000).toFixed(3));
}
