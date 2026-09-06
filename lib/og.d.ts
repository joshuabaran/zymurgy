export declare const SUCROSE_PPG = 46;
export type PredictedOGFermentable = {
    amountLb: number;
    ppg?: number;
    extractPercent?: number;
    lateAddition?: boolean;
};
export declare function extractPercentToPPG(extractPercent: number): number;
export declare function fermentablePoints(amountLb: number, ppg: number): number;
export declare function predictedOG(fermentables: readonly PredictedOGFermentable[], efficiencyPercent: number, batchGal: number): number;
