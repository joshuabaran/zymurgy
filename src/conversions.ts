export function brixToSG(brix: number): number {
  const sg = (brix / (258.6 - ((brix / 258.2) * 227.1))) + 1;
  return Number(sg.toFixed(3));
}

export function sgToBrix(sg: number): number {
  const brix = ((182.4601 * sg - 775.6821) * sg + 1262.7794) * sg - 669.5622;
  return Number(brix.toFixed(1)) || 0;
}

// Same sucrose-solution fit as brixToSG (Brewer's Friend / ASBC tables).
export function platoToSG(plato: number): number {
  return brixToSG(plato);
}

// ASBC-fit cubic used by Brewer's Friend. Not the inverse of sgToBrix.
export function sgToPlato(sg: number): number {
  const plato = ((135.997 * sg - 630.272) * sg + 1111.14) * sg - 616.868;
  return Number(plato.toFixed(1)) || 0;
}

export function sgToPoints(sg: number): number {
  return Number(((sg - 1) * 1000).toFixed(0));
}

export function pointsToSG(points: number): number {
  return Number((1 + points / 1000).toFixed(3));
}
