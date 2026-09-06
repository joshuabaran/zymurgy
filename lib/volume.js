"use strict";
// Thin volume / mash numerics only (brewledger docs/02-calculations.md section 7).
// Vessel wiring (deadspace, 3-vessel order, sparge algebra) stays in the app.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SHRINKAGE_FRAC = void 0;
exports.boilOffGal = boilOffGal;
exports.applyShrinkage = applyShrinkage;
exports.undoShrinkage = undoShrinkage;
exports.grainAbsorptionGal = grainAbsorptionGal;
exports.strikeTemperatureF = strikeTemperatureF;
exports.DEFAULT_SHRINKAGE_FRAC = 0.04;
function boilOffGal(rateGalPerHour, hours) {
    return Number((rateGalPerHour * hours).toFixed(3));
}
function applyShrinkage(hotVolume, shrinkageFrac = exports.DEFAULT_SHRINKAGE_FRAC) {
    return Number((hotVolume * (1 - shrinkageFrac)).toFixed(3));
}
function undoShrinkage(coldVolume, shrinkageFrac = exports.DEFAULT_SHRINKAGE_FRAC) {
    if (shrinkageFrac === 1) {
        return 0;
    }
    return Number((coldVolume / (1 - shrinkageFrac)).toFixed(3));
}
function grainAbsorptionGal(grainLb, absorptionGalPerLb) {
    return Number((grainLb * absorptionGalPerLb).toFixed(3));
}
// Palmer, How to Brew: strike_F = (0.2 / ratio_qt_per_lb) * (target_F - grain_F) + target_F
function strikeTemperatureF(targetF, grainF, ratioQtPerLb) {
    const strike = (0.2 / ratioQtPerLb) * (targetF - grainF) + targetF;
    return Number(strike.toFixed(1));
}
