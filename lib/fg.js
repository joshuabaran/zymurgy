"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictedFG = predictedFG;
// Inverse of apparentAttenuation: yeast lab attenuation specs are apparent attenuation.
function predictedFG(og, attenuationPercent) {
    const ogPoints = (og - 1) * 1000;
    const fgPoints = ogPoints * (1 - attenuationPercent / 100);
    return Number((1 + fgPoints / 1000).toFixed(3));
}
