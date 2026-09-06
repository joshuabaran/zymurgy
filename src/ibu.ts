// Tinseth utilization (Glenn Tinseth, 1997) plus a simplified whirlpool/hopstand scale.
// brewledger docs/02-calculations.md section 5.
//
// Locked defaults (also CHANGELOG / PR):
// 1. Gravity input is pre-boil SG (Brewfather-like). Parameter is named preBoilSG; callers pass that SG.
// 2. Whirlpool temp→util is linear: factor 1.0 at 212°F, 0.15 at 170°F, clamp outside that band;
//    multiply the Tinseth time factor at contact minutes. Chosen as a simple published-style
//    linear band (not Garetz/Rager).
// 3. Cryo form factor = pellet (1.1) for MVP — Cryo already carries higher AA% on the label.
//    Forms are explicit: pellet | whole | plug | cryo. Plug uses BeerSmith's 1.02 vs whole 1.0.

export type HopForm = 'pellet' | 'whole' | 'plug' | 'cryo';
export type HopUse = 'boil' | 'whirlpool' | 'dryHop';

export const HOP_FORM_FACTOR = {
  pellet: 1.1,
  whole: 1,
  plug: 1.02,
  cryo: 1.1,
} as const;

export type TinsethHopAddition = {
  massG: number;
  alphaAcidPercent: number;
  timeMin: number;
  use: HopUse;
  form?: HopForm;
  // Whirlpool/hopstand wort temperature in °F. Ignored for boil and dry hop. Defaults to 212.
  whirlpoolTempF?: number;
};

export function hopFormFactor(form: HopForm): number {
  return HOP_FORM_FACTOR[form];
}

export function whirlpoolTempFactor(tempF: number): number {
  const t = (tempF - 170) / (212 - 170);
  const factor = 0.15 + 0.85 * t;
  const clamped = factor < 0.15 ? 0.15 : factor > 1 ? 1 : factor;
  return Number(clamped.toFixed(3));
}

export function tinsethUtilization(preBoilSG: number, timeMin: number): number {
  return Number((tinsethBigness(preBoilSG) * tinsethTimeFactor(timeMin)).toFixed(4));
}

export function tinsethIBU(
  hops: readonly TinsethHopAddition[],
  preBoilSG: number,
  volumeL: number,
  hopUtilizationFactor: number = 1
): number {
  if (volumeL === 0) {
    return 0;
  }

  let ibu = 0;
  for (const hop of hops) {
    if (hop.use === 'dryHop') {
      continue;
    }

    const form = hopFormFactor(hop.form ?? 'pellet');
    let utilization = tinsethBigness(preBoilSG) * tinsethTimeFactor(hop.timeMin);
    if (hop.use === 'whirlpool') {
      const tempF = hop.whirlpoolTempF === undefined ? 212 : hop.whirlpoolTempF;
      utilization *= whirlpoolTempFactor(tempF);
    }

    const mgPerL = ((hop.alphaAcidPercent / 100) * hop.massG * 1000) / volumeL;
    ibu += mgPerL * utilization * form * hopUtilizationFactor;
  }

  return Number(ibu.toFixed(1)) || 0;
}

function tinsethBigness(preBoilSG: number): number {
  return 1.65 * Math.pow(0.000125, preBoilSG - 1);
}

function tinsethTimeFactor(timeMin: number): number {
  return (1 - Math.exp(-0.04 * timeMin)) / 4.15;
}
