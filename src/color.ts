// Morey SRM from MCU (Dan Morey, 1995; brewledger docs/02-calculations.md section 6).
export function maltColorUnits(colorLovibond: number, amountLb: number, batchGal: number): number {
  if (batchGal === 0) {
    return 0;
  }
  return (colorLovibond * amountLb) / batchGal;
}

export function moreySRM(mcu: number): number {
  return Number((1.4922 * Math.pow(mcu, 0.6859)).toFixed(1)) || 0;
}

// EBC ≈ SRM * 1.97 (brewledger docs/02-calculations.md section 6).
export function srmToEBC(srm: number): number {
  return Number((srm * 1.97).toFixed(1)) || 0;
}
