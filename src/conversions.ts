export function brixToSG(brix: number): number {
  const sg = (brix / (258.6 - ((brix / 258.2) * 227.1))) + 1;
  return Number(sg.toFixed(3));
}

export function sgToBrix(sg: number): number {
  const brix = ((182.4601 * sg - 775.6821) * sg + 1262.7794) * sg - 669.5622;
  return Number(brix.toFixed(1)) || 0;
}
