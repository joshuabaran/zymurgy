"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictedFG = predictedFG;
// Predicted FG from OG and yeast apparent attenuation: FG points = OG points × (1 − attenuation).
function predictedFG(og, attenuationPercent) {
    const ogPoints = (og - 1) * 1000;
    const fgPoints = ogPoints * (1 - attenuationPercent / 100);
    return Number((1 + fgPoints / 1000).toFixed(3));
}
