// Standard homebrew estimate: (OG - FG) * 131.25
export function abv(og: number, fg: number): number {
  return Number(((og - fg) * 131.25).toFixed(1));
}

// Hall / Brewer's Friend alternate ABV.
export function abvAlternate(og: number, fg: number): number {
  const value = (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794);
  return Number(value.toFixed(1));
}

export function apparentAttenuation(og: number, fg: number): number {
  if (og === 1) {
    return 0;
  }
  return Number((((og - fg) / (og - 1)) * 100).toFixed(1));
}
