"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maltColorUnits = maltColorUnits;
exports.moreySRM = moreySRM;
exports.srmToEBC = srmToEBC;
// Morey SRM from MCU (Dan Morey, 1995; brewledger docs/02-calculations.md section 6).
function maltColorUnits(colorLovibond, amountLb, batchGal) {
    if (batchGal === 0) {
        return 0;
    }
    return (colorLovibond * amountLb) / batchGal;
}
function moreySRM(mcu) {
    return Number((1.4922 * Math.pow(mcu, 0.6859)).toFixed(1)) || 0;
}
// EBC ≈ SRM * 1.97 (brewledger docs/02-calculations.md section 6).
function srmToEBC(srm) {
    return Number((srm * 1.97).toFixed(1)) || 0;
}
