// Yeast starter planning: cells needed, liquid yeast viability, starter wort from DME, and growth.
//
// Locked defaults (also CHANGELOG / README):
// 1. Cells are in billions (B), volumes in liters, pitch rates in million cells / mL / °P.
// 2. Pitch rates are the common homebrew presets (Fix / Brewer's Friend): ale 0.75, high-gravity ale 1.0,
//    lager 1.5, high-gravity lager 2.0. "High gravity" is above 1.060 / 15 °P.
// 3. Liquid yeast viability is linear from the manufacture date: start 97% and lose 0.7% per day
//    (~21% per month), clamped to [0, start]. Newer packs (e.g. PurePitch Next Gen) decline more slowly;
//    callers can pass their own start and rate, or skip this and use a known viability.
// 4. DME is 44 PPG (100 g in 1 L ≈ 1.037, the classic starter rule). DME grams count as grams of extract.
// 5. Growth is Kai Troester's (Braukaiser) model in billions of cells per gram of extract, keyed on the
//    inoculation rate (starting cells ÷ grams of extract). Stir plate: 1.4 B/g below 1.4 B/g,
//    2.33 − 0.67 × rate from 1.4 to 3.5 (clamped at 0, since it crosses 0 at ~3.48), none above 3.5.
//    Shaken 0.62 B/g and still 0.4 B/g, both none above 3.5. Treat results as ±15% estimates; the model
//    is stated for stir plates and may overestimate for starters above ~5 L.

import { predictedOG } from './og';
import { sgToPoints } from './conversions';
import { LITERS_PER_US_GAL } from './water';

const GRAMS_PER_LB = 453.59237;

export type PitchRateStyle = 'ale' | 'highGravityAle' | 'lager' | 'highGravityLager';

export const PITCH_RATE: Readonly<Record<PitchRateStyle, number>> = Object.freeze({
  ale: 0.75,
  highGravityAle: 1.0,
  lager: 1.5,
  highGravityLager: 2.0,
});

export const DEFAULT_YEAST_VIABILITY_START_PERCENT = 97;
export const DEFAULT_YEAST_VIABILITY_DROP_PERCENT_PER_DAY = 0.7;
export const DME_PPG = 44;

export type StarterAgitation = 'stirPlate' | 'shaken' | 'none';

// Troester/Braukaiser growth in B cells per gram of extract at low inoculation rates.
export const STARTER_GROWTH_B_PER_G: Readonly<Record<StarterAgitation, number>> = Object.freeze({
  stirPlate: 1.4,
  shaken: 0.62,
  none: 0.4,
});
// Stir plate growth is flat below this inoculation rate (B cells per gram of extract), then declines.
export const STARTER_STIR_PLATE_FLAT_BELOW_B_PER_G = 1.4;
// Above this inoculation rate (B cells per gram of extract) no growth is expected.
export const STARTER_MAX_INOCULATION_B_PER_G = 3.5;

export type StarterGrowth = {
  // Starting cells per gram of extract (B/g).
  inoculationRate: number;
  // New cells grown (B).
  grownB: number;
  // Starting plus grown cells (B).
  totalB: number;
};

// Cells needed, in billions: rate (M/mL/°P) × liters × °P. (rate × mL × °P is millions; the 1000s cancel.)
export function targetCells(pitchRate: number, batchL: number, plato: number): number {
  return Number((pitchRate * batchL * plato).toFixed(1));
}

// The pitch rate (M/mL/°P) a cell count gives. Returns 0 when the batch has no volume or extract.
export function pitchRateFor(cellsB: number, batchL: number, plato: number): number {
  if (batchL === 0 || plato === 0) {
    return 0;
  }
  return Number((cellsB / (batchL * plato)).toFixed(2));
}

export function liquidYeastViability(
  daysSinceManufacture: number,
  startPercent: number = DEFAULT_YEAST_VIABILITY_START_PERCENT,
  dropPercentPerDay: number = DEFAULT_YEAST_VIABILITY_DROP_PERCENT_PER_DAY
): number {
  const viability = startPercent - dropPercentPerDay * Math.max(0, daysSinceManufacture);
  return Number(Math.min(startPercent, Math.max(0, viability)).toFixed(1));
}

// Grams of DME for a starter of `liters` at `sg`. Returns 0 for no volume or a 0 PPG.
export function dmeForGravity(sg: number, liters: number, ppg: number = DME_PPG): number {
  if (liters === 0 || ppg === 0) {
    return 0;
  }
  const gallons = liters / LITERS_PER_US_GAL;
  const pounds = (sgToPoints(sg) * gallons) / ppg;
  return Number((pounds * GRAMS_PER_LB).toFixed(1));
}

// Starter gravity from grams of DME in `liters`: predictedOG with the DME as a 100%-efficient addition.
export function starterGravity(dmeGrams: number, liters: number, ppg: number = DME_PPG): number {
  return predictedOG([{ amountLb: dmeGrams / GRAMS_PER_LB, ppg, lateAddition: true }], 100, liters / LITERS_PER_US_GAL);
}

function rawGrowthPerGram(inoculationBPerG: number, agitation: StarterAgitation): number {
  if (inoculationBPerG > STARTER_MAX_INOCULATION_B_PER_G) {
    return 0;
  }
  if (agitation !== 'stirPlate' || inoculationBPerG < STARTER_STIR_PLATE_FLAT_BELOW_B_PER_G) {
    return STARTER_GROWTH_B_PER_G[agitation];
  }
  return Math.max(0, 2.33 - 0.67 * inoculationBPerG);
}

// Growth in B cells per gram of extract for an inoculation rate in B cells per gram of extract.
export function starterGrowthPerGram(inoculationBPerG: number, agitation: StarterAgitation): number {
  return Number(rawGrowthPerGram(inoculationBPerG, agitation).toFixed(3));
}

// Rounds to tenths. The 1e-8 nudge (as in troesterMashPH) keeps binary halfway values like 79.05 from
// rounding down, so grownB and totalB round the same way.
function roundTenths(value: number): number {
  return Number((Math.round(value * 10 + 1e-8) / 10).toFixed(1));
}

// Cells after a starter. totalB is startCellsB + grownB, rounded to tenths. With no extract there is no growth.
export function starterGrowth(startCellsB: number, extractGrams: number, agitation: StarterAgitation): StarterGrowth {
  if (extractGrams === 0) {
    return { inoculationRate: 0, grownB: 0, totalB: roundTenths(startCellsB) };
  }
  const inoculationRate = startCellsB / extractGrams;
  const grownB = roundTenths(rawGrowthPerGram(inoculationRate, agitation) * extractGrams);
  return {
    inoculationRate: Number(inoculationRate.toFixed(2)),
    grownB,
    totalB: roundTenths(startCellsB + grownB),
  };
}
