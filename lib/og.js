"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUCROSE_PPG = void 0;
exports.extractPercentToPPG = extractPercentToPPG;
exports.fermentablePoints = fermentablePoints;
exports.predictedOG = predictedOG;
// Points / PPG method (brewledger docs/02-calculations.md section 2).
// BeerJSON yield.fineGrind / potential: PPG ≈ yield% / 100 * 46 (sucrose).
exports.SUCROSE_PPG = 46;
function extractPercentToPPG(extractPercent) {
    return Number(((extractPercent / 100) * exports.SUCROSE_PPG).toFixed(1));
}
function fermentablePoints(amountLb, ppg) {
    return amountLb * ppg;
}
function predictedOG(fermentables, efficiencyPercent, batchGal) {
    var _a;
    if (batchGal === 0) {
        return 1;
    }
    let mashPoints = 0;
    let lateSugarPoints = 0;
    for (const fermentable of fermentables) {
        const ppg = fermentable.ppg !== undefined
            ? fermentable.ppg
            : extractPercentToPPG((_a = fermentable.extractPercent) !== null && _a !== void 0 ? _a : 0);
        const points = fermentablePoints(fermentable.amountLb, ppg);
        if (fermentable.lateAddition) {
            lateSugarPoints += points;
        }
        else {
            mashPoints += points;
        }
    }
    const ogPoints = (mashPoints * (efficiencyPercent / 100) + lateSugarPoints) / batchGal;
    return Number((1 + ogPoints / 1000).toFixed(3));
}
