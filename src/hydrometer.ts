// Water-density cubic used by Vinolab / homebrew hydrometer calculators. T in °F.
function waterDensityFactor(tempF: number): number {
  return 1.00130346
    - 1.34722124e-4 * tempF
    + 2.04052596e-6 * tempF * tempF
    - 2.32820948e-9 * tempF * tempF * tempF;
}

export function correctHydrometerSG(
  sg: number,
  sampleTempF: number,
  calibrationTempF: number = 60
): number {
  const corrected = sg * waterDensityFactor(sampleTempF) / waterDensityFactor(calibrationTempF);
  return Number(corrected.toFixed(3));
}
