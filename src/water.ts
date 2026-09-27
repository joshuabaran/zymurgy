// Water chemistry v1 — Dirt Wolf FINAL / Braukaiser = Kai Troester.
// Named water profiles are out of scope. Phosphoric, NaCl, pickling lime,
// deLange charge-balance, and anhydrous CaCl2-as-default are parked.
//
// Locked defaults:
// 1. Kolbach RA (ppm as CaCO3) = alkalinity − (Ca/1.4 + Mg/1.7), Palmer's ion-ppm form.
//    Kolbach's /3.5 and /7 apply to hardness as CaCO3; Ca and Mg here are ion ppm.
// 2. Mash pH v1 is Troester/Braukaiser: DI mash pH from beer color + RA × spH.
//    Not deLange charge-balance. Color term uses roastedFraction of the specialty/color
//    split (0 = all crystal/non-roast). Default mash thickness is Troester's 4 L/kg.
// 3. Calcium chloride is the dihydrate CaCl2·2H2O. Anhydrous is not assumed.
// 4. Lactic is required; strength % is always an API argument (default 88).
// 5. Salt ion yields are ppm Δ per gram per US gallon (Ken Schwartz / Palmer table).

export type WaterIons = {
  ca: number;
  mg: number;
  na: number;
  cl: number;
  so4: number;
  alkalinity: number;
};

export type WaterSalt = 'bakingSoda' | 'gypsum' | 'calciumChloride' | 'epsom' | 'chalk';

export const RO_WATER: Readonly<WaterIons> = Object.freeze({
  ca: 0,
  mg: 0,
  na: 0,
  cl: 0,
  so4: 0,
  alkalinity: 0,
});

export const LITERS_PER_US_GAL = 3.785411784;

// Hydrate / formula is first-class so callers never have to guess.
export const WATER_SALT_FORMULA = Object.freeze({
  bakingSoda: 'NaHCO3',
  gypsum: 'CaSO4·2H2O',
  calciumChloride: 'CaCl2·2H2O',
  epsom: 'MgSO4·7H2O',
  chalk: 'CaCO3',
} as const);

// Ken Schwartz "Quickie Water Chemistry Primer" / Palmer How to Brew (dihydrate CaCl2).
// Hardness/alkalinity columns in that table are already "as CaCO3".
export const SALT_PPM_PER_G_PER_GAL: Readonly<Record<WaterSalt, Readonly<WaterIons>>> = Object.freeze({
  bakingSoda: Object.freeze({ca: 0, mg: 0, na: 72.3, cl: 0, so4: 0, alkalinity: 157.4}),
  gypsum: Object.freeze({ca: 61.5, mg: 0, na: 0, cl: 0, so4: 147.4, alkalinity: 0}),
  calciumChloride: Object.freeze({ca: 72, mg: 0, na: 0, cl: 127.4, so4: 0, alkalinity: 0}),
  epsom: Object.freeze({ca: 0, mg: 26.1, na: 0, cl: 0, so4: 103, alkalinity: 0}),
  chalk: Object.freeze({ca: 105.8, mg: 0, na: 0, cl: 0, so4: 0, alkalinity: 264.2}),
});

export const DEFAULT_LACTIC_STRENGTH_PERCENT = 88;
// Typical 20 °C density of 88% w/w food-grade lactic. Strength scales acid mass only.
export const LACTIC_ACID_DENSITY_G_PER_ML = 1.206;
export const LACTIC_ACID_MW = 90.08;
export const MEQ_TO_PPM_CACO3 = 50;

// Troester 2009 / Braukaiser color-to-pH v1 (BYO: DI mash pH is 5.57 at 2 SRM).
export const TROESTER_DI_MASH_PH = 5.6;
export const DEFAULT_MASH_THICKNESS_L_PER_KG = 4;
export const TROESTER_COLOR_PLATO_REF = 12;
export const TROESTER_NON_ROAST_COLOR_COEFF = 0.21;
export const TROESTER_ROAST_COLOR_COEFF = 0.06;

export type WaterSaltAddition = {
  salt: WaterSalt;
  grams: number;
};

export function residualAlkalinity(ions: WaterIons): number {
  const ra = ions.alkalinity - (ions.ca / 1.4 + ions.mg / 1.7);
  return Number(ra.toFixed(1)) || 0;
}

export function saltIonDelta(salt: WaterSalt, grams: number, gallons: number): WaterIons {
  return roundIons(rawSaltIonDelta(salt, grams, gallons));
}

export function saltIonDeltaPerGramPerLiter(salt: WaterSalt): WaterIons {
  return saltIonDelta(salt, LITERS_PER_US_GAL, 1);
}

export function addIons(base: WaterIons, delta: WaterIons): WaterIons {
  return roundIons(sumIons(base, delta));
}

// Sums unrounded deltas and rounds once, so rounding error does not build up per salt.
export function applySalts(
  base: WaterIons,
  additions: readonly WaterSaltAddition[],
  gallons: number
): WaterIons {
  let ions: WaterIons = {...base};
  for (const addition of additions) {
    ions = sumIons(ions, rawSaltIonDelta(addition.salt, addition.grams, gallons));
  }
  return roundIons(ions);
}

export function blendWater(
  source: WaterIons,
  fractionTowardDiluent: number,
  diluent: WaterIons = RO_WATER
): WaterIons {
  const f = fractionTowardDiluent;
  return roundIons({
    ca: source.ca * (1 - f) + diluent.ca * f,
    mg: source.mg * (1 - f) + diluent.mg * f,
    na: source.na * (1 - f) + diluent.na * f,
    cl: source.cl * (1 - f) + diluent.cl * f,
    so4: source.so4 * (1 - f) + diluent.so4 * f,
    alkalinity: source.alkalinity * (1 - f) + diluent.alkalinity * f,
  });
}

export function lacticAlkalinityDrop(
  ml: number,
  gallons: number,
  strengthPercent: number = DEFAULT_LACTIC_STRENGTH_PERCENT
): number {
  return Number(rawLacticDropPpm(ml, gallons * LITERS_PER_US_GAL, strengthPercent).toFixed(1)) || 0;
}

export function lacticAlkalinityDropSI(
  ml: number,
  liters: number,
  strengthPercent: number = DEFAULT_LACTIC_STRENGTH_PERCENT
): number {
  return Number(rawLacticDropPpm(ml, liters, strengthPercent).toFixed(1)) || 0;
}

export function applyLactic(
  ions: WaterIons,
  ml: number,
  gallons: number,
  strengthPercent: number = DEFAULT_LACTIC_STRENGTH_PERCENT
): WaterIons {
  return roundIons({
    ...ions,
    alkalinity: ions.alkalinity - rawLacticDropPpm(ml, gallons * LITERS_PER_US_GAL, strengthPercent),
  });
}

export function troesterRaPhSlope(thicknessLPerKg: number): number {
  return 0.013 * thicknessLPerKg + 0.013;
}

export function troesterColorPhShift(colorSRM: number, roastedFraction: number = 0): number {
  const coeff =
    TROESTER_NON_ROAST_COLOR_COEFF * (1 - roastedFraction) +
    TROESTER_ROAST_COLOR_COEFF * roastedFraction;
  return -(colorSRM * coeff) / TROESTER_COLOR_PLATO_REF;
}

export function troesterMashPH(
  raPpm: number,
  colorSRM: number,
  thicknessLPerKg: number = DEFAULT_MASH_THICKNESS_L_PER_KG,
  roastedFraction: number = 0
): number {
  const di = TROESTER_DI_MASH_PH + troesterColorPhShift(colorSRM, roastedFraction);
  const ph = di + (raPpm / MEQ_TO_PPM_CACO3) * troesterRaPhSlope(thicknessLPerKg);
  // 1e-8 nudges binary 5.565 (2 SRM DI) so toFixed matches the published 5.57 golden.
  return Number((Math.round(ph * 100 + 1e-8) / 100).toFixed(2));
}

export function estimatedMashPH(
  ions: WaterIons,
  colorSRM: number,
  thicknessLPerKg: number = DEFAULT_MASH_THICKNESS_L_PER_KG,
  roastedFraction: number = 0
): number {
  return troesterMashPH(residualAlkalinity(ions), colorSRM, thicknessLPerKg, roastedFraction);
}

function roundIons(ions: WaterIons): WaterIons {
  return {
    ca: Number(ions.ca.toFixed(1)) || 0,
    mg: Number(ions.mg.toFixed(1)) || 0,
    na: Number(ions.na.toFixed(1)) || 0,
    cl: Number(ions.cl.toFixed(1)) || 0,
    so4: Number(ions.so4.toFixed(1)) || 0,
    alkalinity: Number(ions.alkalinity.toFixed(1)) || 0,
  };
}

function rawSaltIonDelta(salt: WaterSalt, grams: number, gallons: number): WaterIons {
  if (gallons === 0) {
    return {...RO_WATER};
  }
  const perGramPerGal = SALT_PPM_PER_G_PER_GAL[salt];
  const scale = grams / gallons;
  return {
    ca: perGramPerGal.ca * scale,
    mg: perGramPerGal.mg * scale,
    na: perGramPerGal.na * scale,
    cl: perGramPerGal.cl * scale,
    so4: perGramPerGal.so4 * scale,
    alkalinity: perGramPerGal.alkalinity * scale,
  };
}

function sumIons(base: WaterIons, delta: WaterIons): WaterIons {
  return {
    ca: base.ca + delta.ca,
    mg: base.mg + delta.mg,
    na: base.na + delta.na,
    cl: base.cl + delta.cl,
    so4: base.so4 + delta.so4,
    alkalinity: base.alkalinity + delta.alkalinity,
  };
}

function rawLacticDropPpm(ml: number, liters: number, strengthPercent: number): number {
  if (liters === 0) {
    return 0;
  }
  const massG = ml * LACTIC_ACID_DENSITY_G_PER_ML * (strengthPercent / 100);
  const meq = (massG / LACTIC_ACID_MW) * 1000;
  return (meq * MEQ_TO_PPM_CACO3) / liters;
}
