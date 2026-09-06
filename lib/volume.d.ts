export declare const DEFAULT_SHRINKAGE_FRAC = 0.04;
export declare function boilOffGal(rateGalPerHour: number, hours: number): number;
export declare function applyShrinkage(hotVolume: number, shrinkageFrac?: number): number;
export declare function undoShrinkage(coldVolume: number, shrinkageFrac?: number): number;
export declare function grainAbsorptionGal(grainLb: number, absorptionGalPerLb: number): number;
export declare function strikeTemperatureF(targetF: number, grainF: number, ratioQtPerLb: number): number;
