"use strict";
// Water chemistry v1 — Dirt Wolf FINAL / Braukaiser = Kai Troester.
// brewledger water-profiles stays out of this cut. Phosphoric, NaCl, pickling lime,
// deLange charge-balance, and anhydrous CaCl2-as-default are parked.
//
// Locked defaults:
// 1. Kolbach RA (ppm as CaCO3) = alkalinity − (Ca/3.5 + Mg/7). Ca and Mg are ion ppm.
// 2. Mash pH v1 is Troester/Braukaiser: DI mash pH from beer color + RA × spH.
//    Not deLange charge-balance. Color term uses roastedFraction of the specialty/color
//    split (0 = all crystal/non-roast). Default mash thickness is Troester's 4 L/kg.
// 3. Calcium chloride is the dihydrate CaCl2·2H2O. Anhydrous is not assumed.
// 4. Lactic is required; strength % is always an API argument (default 88).
// 5. Salt ion yields are ppm Δ per gram per US gallon (Ken Schwartz / Palmer table).
Object.defineProperty(exports, "__esModule", { value: true });
exports.TROESTER_ROAST_COLOR_COEFF = exports.TROESTER_NON_ROAST_COLOR_COEFF = exports.TROESTER_COLOR_PLATO_REF = exports.DEFAULT_MASH_THICKNESS_L_PER_KG = exports.TROESTER_DI_MASH_PH = exports.MEQ_TO_PPM_CACO3 = exports.LACTIC_ACID_MW = exports.LACTIC_ACID_DENSITY_G_PER_ML = exports.DEFAULT_LACTIC_STRENGTH_PERCENT = exports.SALT_PPM_PER_G_PER_GAL = exports.WATER_SALT_FORMULA = exports.LITERS_PER_US_GAL = exports.RO_WATER = void 0;
exports.residualAlkalinity = residualAlkalinity;
exports.saltIonDelta = saltIonDelta;
exports.saltIonDeltaPerGramPerLiter = saltIonDeltaPerGramPerLiter;
exports.addIons = addIons;
exports.applySalts = applySalts;
exports.blendWater = blendWater;
exports.lacticAlkalinityDrop = lacticAlkalinityDrop;
exports.lacticAlkalinityDropSI = lacticAlkalinityDropSI;
exports.applyLactic = applyLactic;
exports.troesterRaPhSlope = troesterRaPhSlope;
exports.troesterColorPhShift = troesterColorPhShift;
exports.troesterMashPH = troesterMashPH;
exports.estimatedMashPH = estimatedMashPH;
exports.RO_WATER = {
    ca: 0,
    mg: 0,
    na: 0,
    cl: 0,
    so4: 0,
    alkalinity: 0,
};
exports.LITERS_PER_US_GAL = 3.785411784;
// Hydrate / formula is first-class so brewledger never guesses.
exports.WATER_SALT_FORMULA = {
    bakingSoda: 'NaHCO3',
    gypsum: 'CaSO4·2H2O',
    calciumChloride: 'CaCl2·2H2O',
    epsom: 'MgSO4·7H2O',
    chalk: 'CaCO3',
};
// Ken Schwartz "Quickie Water Chemistry Primer" / Palmer How to Brew (dihydrate CaCl2).
// Hardness/alkalinity columns in that table are already "as CaCO3".
exports.SALT_PPM_PER_G_PER_GAL = {
    bakingSoda: { ca: 0, mg: 0, na: 72.3, cl: 0, so4: 0, alkalinity: 157.4 },
    gypsum: { ca: 61.5, mg: 0, na: 0, cl: 0, so4: 147.4, alkalinity: 0 },
    calciumChloride: { ca: 72, mg: 0, na: 0, cl: 127.4, so4: 0, alkalinity: 0 },
    epsom: { ca: 0, mg: 26.1, na: 0, cl: 0, so4: 103, alkalinity: 0 },
    chalk: { ca: 105.8, mg: 0, na: 0, cl: 0, so4: 0, alkalinity: 264.2 },
};
exports.DEFAULT_LACTIC_STRENGTH_PERCENT = 88;
// Typical 20 °C density of 88% w/w food-grade lactic. Strength scales acid mass only.
exports.LACTIC_ACID_DENSITY_G_PER_ML = 1.206;
exports.LACTIC_ACID_MW = 90.08;
exports.MEQ_TO_PPM_CACO3 = 50;
// Troester 2009 / Braukaiser color-to-pH v1 (BYO: DI mash pH is 5.57 at 2 SRM).
exports.TROESTER_DI_MASH_PH = 5.6;
exports.DEFAULT_MASH_THICKNESS_L_PER_KG = 4;
exports.TROESTER_COLOR_PLATO_REF = 12;
exports.TROESTER_NON_ROAST_COLOR_COEFF = 0.21;
exports.TROESTER_ROAST_COLOR_COEFF = 0.06;
function residualAlkalinity(ions) {
    const ra = ions.alkalinity - (ions.ca / 3.5 + ions.mg / 7);
    return Number(ra.toFixed(1)) || 0;
}
function saltIonDelta(salt, grams, gallons) {
    if (gallons === 0) {
        return Object.assign({}, exports.RO_WATER);
    }
    const perGramPerGal = exports.SALT_PPM_PER_G_PER_GAL[salt];
    const scale = grams / gallons;
    return roundIons({
        ca: perGramPerGal.ca * scale,
        mg: perGramPerGal.mg * scale,
        na: perGramPerGal.na * scale,
        cl: perGramPerGal.cl * scale,
        so4: perGramPerGal.so4 * scale,
        alkalinity: perGramPerGal.alkalinity * scale,
    });
}
function saltIonDeltaPerGramPerLiter(salt) {
    return saltIonDelta(salt, exports.LITERS_PER_US_GAL, 1);
}
function addIons(base, delta) {
    return roundIons({
        ca: base.ca + delta.ca,
        mg: base.mg + delta.mg,
        na: base.na + delta.na,
        cl: base.cl + delta.cl,
        so4: base.so4 + delta.so4,
        alkalinity: base.alkalinity + delta.alkalinity,
    });
}
function applySalts(base, additions, gallons) {
    let ions = Object.assign({}, base);
    for (const addition of additions) {
        ions = addIons(ions, saltIonDelta(addition.salt, addition.grams, gallons));
    }
    return ions;
}
function blendWater(source, fractionTowardDiluent, diluent = exports.RO_WATER) {
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
function lacticAlkalinityDrop(ml, gallons, strengthPercent = exports.DEFAULT_LACTIC_STRENGTH_PERCENT) {
    if (gallons === 0) {
        return 0;
    }
    return lacticAlkalinityDropSI(ml, gallons * exports.LITERS_PER_US_GAL, strengthPercent);
}
function lacticAlkalinityDropSI(ml, liters, strengthPercent = exports.DEFAULT_LACTIC_STRENGTH_PERCENT) {
    if (liters === 0) {
        return 0;
    }
    const massG = ml * exports.LACTIC_ACID_DENSITY_G_PER_ML * (strengthPercent / 100);
    const meq = (massG / exports.LACTIC_ACID_MW) * 1000;
    const ppm = (meq * exports.MEQ_TO_PPM_CACO3) / liters;
    return Number(ppm.toFixed(1)) || 0;
}
function applyLactic(ions, ml, gallons, strengthPercent = exports.DEFAULT_LACTIC_STRENGTH_PERCENT) {
    return roundIons(Object.assign(Object.assign({}, ions), { alkalinity: ions.alkalinity - lacticAlkalinityDrop(ml, gallons, strengthPercent) }));
}
function troesterRaPhSlope(thicknessLPerKg) {
    return 0.013 * thicknessLPerKg + 0.013;
}
function troesterColorPhShift(colorSRM, roastedFraction = 0) {
    const coeff = exports.TROESTER_NON_ROAST_COLOR_COEFF * (1 - roastedFraction) +
        exports.TROESTER_ROAST_COLOR_COEFF * roastedFraction;
    return -(colorSRM * coeff) / exports.TROESTER_COLOR_PLATO_REF;
}
function troesterMashPH(raPpm, colorSRM, thicknessLPerKg = exports.DEFAULT_MASH_THICKNESS_L_PER_KG, roastedFraction = 0) {
    const di = exports.TROESTER_DI_MASH_PH + troesterColorPhShift(colorSRM, roastedFraction);
    const ph = di + (raPpm / exports.MEQ_TO_PPM_CACO3) * troesterRaPhSlope(thicknessLPerKg);
    // 1e-8 nudges binary 5.565 (2 SRM DI) so toFixed matches the published 5.57 golden.
    return Number((Math.round(ph * 100 + 1e-8) / 100).toFixed(2));
}
function estimatedMashPH(ions, colorSRM, thicknessLPerKg = exports.DEFAULT_MASH_THICKNESS_L_PER_KG, roastedFraction = 0) {
    return troesterMashPH(residualAlkalinity(ions), colorSRM, thicknessLPerKg, roastedFraction);
}
function roundIons(ions) {
    return {
        ca: Number(ions.ca.toFixed(1)) || 0,
        mg: Number(ions.mg.toFixed(1)) || 0,
        na: Number(ions.na.toFixed(1)) || 0,
        cl: Number(ions.cl.toFixed(1)) || 0,
        so4: Number(ions.so4.toFixed(1)) || 0,
        alkalinity: Number(ions.alkalinity.toFixed(1)) || 0,
    };
}
