"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abv = abv;
exports.abvAlternate = abvAlternate;
exports.apparentAttenuation = apparentAttenuation;
// Standard homebrew estimate: (OG - FG) * 131.25
function abv(og, fg) {
    return Number(((og - fg) * 131.25).toFixed(1));
}
// Hall / Brewer's Friend alternate ABV.
function abvAlternate(og, fg) {
    const value = (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794);
    return Number(value.toFixed(1));
}
function apparentAttenuation(og, fg) {
    if (og === 1) {
        return 0;
    }
    return Number((((og - fg) / (og - 1)) * 100).toFixed(1));
}
