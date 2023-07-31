"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sgToBrix = exports.brixToSG = void 0;
function brixToSG(brix) {
    const sg = (brix / (258.6 - ((brix / 258.2) * 227.1))) + 1;
    return Number(sg.toFixed(3));
}
exports.brixToSG = brixToSG;
function sgToBrix(sg) {
    const brix = ((182.4601 * sg - 775.6821) * sg + 1262.7794) * sg - 669.5622;
    return Number(brix.toFixed(1)) || 0;
}
exports.sgToBrix = sgToBrix;
