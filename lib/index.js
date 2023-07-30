"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sgToBrix = exports.brixToSG = void 0;
function brixToSG(brix) {
    return (brix * 4 / 1000) + 1;
}
exports.brixToSG = brixToSG;
function sgToBrix(sg) {
    return sg / 4;
}
exports.sgToBrix = sgToBrix;
