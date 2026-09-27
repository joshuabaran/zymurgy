"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.STARTER_MAX_INOCULATION_B_PER_G = exports.STARTER_STIR_PLATE_FLAT_BELOW_B_PER_G = exports.STARTER_GROWTH_B_PER_G = exports.DME_PPG = exports.DEFAULT_YEAST_VIABILITY_DROP_PERCENT_PER_DAY = exports.DEFAULT_YEAST_VIABILITY_START_PERCENT = exports.PITCH_RATE = void 0;
exports.targetCells = targetCells;
exports.pitchRateFor = pitchRateFor;
exports.liquidYeastViability = liquidYeastViability;
exports.dmeForGravity = dmeForGravity;
exports.starterGravity = starterGravity;
exports.starterGrowthPerGram = starterGrowthPerGram;
exports.starterGrowth = starterGrowth;
const og_1 = require("./og");
const conversions_1 = require("./conversions");
const water_1 = require("./water");
const GRAMS_PER_LB = 453.59237;
exports.PITCH_RATE = Object.freeze({
    ale: 0.75,
    highGravityAle: 1.0,
    lager: 1.5,
    highGravityLager: 2.0,
});
exports.DEFAULT_YEAST_VIABILITY_START_PERCENT = 97;
exports.DEFAULT_YEAST_VIABILITY_DROP_PERCENT_PER_DAY = 0.7;
exports.DME_PPG = 44;
// Troester/Braukaiser growth in B cells per gram of extract at low inoculation rates.
exports.STARTER_GROWTH_B_PER_G = Object.freeze({
    stirPlate: 1.4,
    shaken: 0.62,
    none: 0.4,
});
// Stir plate growth is flat below this inoculation rate (B cells per gram of extract), then declines.
exports.STARTER_STIR_PLATE_FLAT_BELOW_B_PER_G = 1.4;
// Above this inoculation rate (B cells per gram of extract) no growth is expected.
exports.STARTER_MAX_INOCULATION_B_PER_G = 3.5;
// Cells needed = rate (M/mL/°P) × mL × °P. Returned in billions.
function targetCells(pitchRate, batchL, plato) {
    return Number(((pitchRate * batchL * 1000 * plato) / 1000).toFixed(1));
}
// The pitch rate (M/mL/°P) a cell count gives. Returns 0 when the batch has no volume or extract.
function pitchRateFor(cellsB, batchL, plato) {
    if (batchL <= 0 || plato <= 0) {
        return 0;
    }
    return Number(((cellsB * 1000) / (batchL * 1000 * plato)).toFixed(2));
}
function liquidYeastViability(daysSinceManufacture, startPercent = exports.DEFAULT_YEAST_VIABILITY_START_PERCENT, dropPercentPerDay = exports.DEFAULT_YEAST_VIABILITY_DROP_PERCENT_PER_DAY) {
    const viability = startPercent - dropPercentPerDay * Math.max(0, daysSinceManufacture);
    return Number(Math.min(startPercent, Math.max(0, viability)).toFixed(1));
}
// Grams of DME for a starter of `liters` at `sg`. Returns 0 for no volume.
function dmeForGravity(sg, liters, ppg = exports.DME_PPG) {
    if (liters <= 0 || ppg <= 0) {
        return 0;
    }
    const gallons = liters / water_1.LITERS_PER_US_GAL;
    const pounds = ((0, conversions_1.sgToPoints)(sg) * gallons) / ppg;
    return Number((pounds * GRAMS_PER_LB).toFixed(1));
}
// Starter gravity from grams of DME in `liters`: predictedOG with the DME as a 100%-efficient addition.
function starterGravity(dmeGrams, liters, ppg = exports.DME_PPG) {
    return (0, og_1.predictedOG)([{ amountLb: dmeGrams / GRAMS_PER_LB, ppg, lateAddition: true }], 100, liters / water_1.LITERS_PER_US_GAL);
}
function rawGrowthPerGram(inoculationBPerG, agitation) {
    if (inoculationBPerG > exports.STARTER_MAX_INOCULATION_B_PER_G) {
        return 0;
    }
    if (agitation !== 'stirPlate' || inoculationBPerG < exports.STARTER_STIR_PLATE_FLAT_BELOW_B_PER_G) {
        return exports.STARTER_GROWTH_B_PER_G[agitation];
    }
    return Math.max(0, 2.33 - 0.67 * inoculationBPerG);
}
// Growth in B cells per gram of extract for an inoculation rate in B cells per gram of extract.
function starterGrowthPerGram(inoculationBPerG, agitation) {
    return Number(rawGrowthPerGram(inoculationBPerG, agitation).toFixed(3));
}
// Cells after a starter. With no extract there is no growth.
function starterGrowth(startCellsB, extractGrams, agitation) {
    if (extractGrams <= 0) {
        return { inoculationRate: 0, grownB: 0, totalB: Number(startCellsB.toFixed(1)) };
    }
    const inoculationRate = startCellsB / extractGrams;
    const grown = rawGrowthPerGram(inoculationRate, agitation) * extractGrams;
    return {
        inoculationRate: Number(inoculationRate.toFixed(2)),
        grownB: Number(grown.toFixed(1)),
        totalB: Number((startCellsB + grown).toFixed(1)),
    };
}
