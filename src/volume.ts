// Thin volume / mash numerics only (brewledger docs/02-calculations.md section 7).
// Vessel wiring (deadspace, 3-vessel order, sparge algebra) stays in the app.

export const DEFAULT_SHRINKAGE_FRAC = 0.04;

export function boilOffGal(rateGalPerHour: number, hours: number): number {
  return Number((rateGalPerHour * hours).toFixed(3));
}

export function applyShrinkage(hotVolume: number, shrinkageFrac: number = DEFAULT_SHRINKAGE_FRAC): number {
  return Number((hotVolume * (1 - shrinkageFrac)).toFixed(3));
}

export function undoShrinkage(coldVolume: number, shrinkageFrac: number = DEFAULT_SHRINKAGE_FRAC): number {
  if (shrinkageFrac === 1) {
    return 0;
  }
  return Number((coldVolume / (1 - shrinkageFrac)).toFixed(3));
}

export function grainAbsorptionGal(grainLb: number, absorptionGalPerLb: number): number {
  return Number((grainLb * absorptionGalPerLb).toFixed(3));
}

// Palmer, How to Brew: strike_F = (0.2 / ratio_qt_per_lb) * (target_F - grain_F) + target_F
export function strikeTemperatureF(targetF: number, grainF: number, ratioQtPerLb: number): number {
  const strike = (0.2 / ratioQtPerLb) * (targetF - grainF) + targetF;
  return Number(strike.toFixed(1));
}
