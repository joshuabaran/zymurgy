export function brixToSG(brix: number): number {
  return (brix * 4 / 1000) + 1;
}

export function sgToBrix(sg: number): number {
  return sg / 4;
}
