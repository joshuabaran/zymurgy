export type HopForm = 'pellet' | 'whole' | 'plug' | 'cryo';
export type HopUse = 'boil' | 'whirlpool' | 'dryHop';
export declare const HOP_FORM_FACTOR: {
    readonly pellet: 1.1;
    readonly whole: 1;
    readonly plug: 1.02;
    readonly cryo: 1.1;
};
export type TinsethHopAddition = {
    massG: number;
    alphaAcidPercent: number;
    timeMin: number;
    use: HopUse;
    form?: HopForm;
    whirlpoolTempF?: number;
};
export declare function hopFormFactor(form: HopForm): number;
export declare function whirlpoolTempFactor(tempF: number): number;
export declare function tinsethUtilization(preBoilSG: number, timeMin: number): number;
export declare function tinsethIBU(hops: readonly TinsethHopAddition[], preBoilSG: number, volumeL: number, hopUtilizationFactor?: number): number;
