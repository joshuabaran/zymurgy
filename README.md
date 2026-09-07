# zymurgy

A small TypeScript library of utilities for estimating beer and wine fermentation.

Published as [`@jbaran/zymurgy`](https://www.npmjs.com/package/@jbaran/zymurgy). There are no runtime dependencies.

## Install

```bash
npm install @jbaran/zymurgy
```

## Usage

```js
const {
  brixToSG,
  sgToBrix,
  platoToSG,
  sgToPlato,
  sgToPoints,
  pointsToSG,
  abv,
  abvAlternate,
  apparentAttenuation,
  correctHydrometerSG,
  predictedOG,
  predictedFG,
  tinsethIBU,
  moreySRM,
  maltColorUnits,
  strikeTemperatureF,
  residualAlkalinity,
  saltIonDelta,
  lacticAlkalinityDrop,
  troesterMashPH,
  blendWater,
} = require('@jbaran/zymurgy');

brixToSG(10);                      // 1.04
sgToBrix(1.04);                    // 10
platoToSG(12);                     // 1.048
sgToPlato(1.048);                  // 11.9
sgToPoints(1.040);                 // 40
abv(1.050, 1.010);                 // 5.3
abvAlternate(1.060, 1.012);        // 6.5
apparentAttenuation(1.050, 1.010); // 80
correctHydrometerSG(1.050, 80);    // 1.052  (80 °F sample, 60 °F hydrometer)
predictedOG([{ amountLb: 10, ppg: 36 }], 75, 5); // 1.054
predictedFG(1.050, 80);            // 1.01
tinsethIBU([{ massG: 30, alphaAcidPercent: 6, timeMin: 60, use: 'boil', form: 'whole' }], 1.040, 20); // 22.7
moreySRM(maltColorUnits(10, 8, 5)); // 10
strikeTemperatureF(152, 70, 1.25); // 165.1
residualAlkalinity({ca: 50, mg: 10, na: 0, cl: 0, so4: 0, alkalinity: 50}); // 34.3
saltIonDelta('gypsum', 1, 1).ca;   // 61.5  (CaSO4·2H2O, 1 g per gal)
lacticAlkalinityDrop(1, 1, 88);    // 155.6 ppm as CaCO3
troesterMashPH(0, 2);              // 5.57  (RA 0, 2 SRM, 4 L/kg)
blendWater({ca: 100, mg: 20, na: 40, cl: 60, so4: 80, alkalinity: 120}, 0.5).ca; // 50
```

These are brewing estimates, not lab-grade measurements. Specific gravity is rounded to 3 decimal places, Brix and Plato to 1, gravity points to the nearest integer, ABV / attenuation / IBU / SRM / EBC to 1 decimal, volumes to 3, strike temperature to 1, ion / RA / lactic alkalinity-drop ppm to 1, and mash pH to 2. Related conversions are not always exact inverses.

## API

### Gravity

#### `brixToSG(brix: number): number`

Converts degrees Brix to specific gravity.

| Brix | SG    |
|------|-------|
| 0    | 1.000 |
| 1    | 1.004 |
| 10   | 1.040 |
| 20   | 1.083 |
| 30   | 1.129 |
| 40   | 1.179 |

#### `sgToBrix(sg: number): number`

Converts specific gravity to degrees Brix.

| SG    | Brix |
|-------|------|
| 1.000 | 0    |
| 1.004 | 1    |
| 1.040 | 10   |
| 1.083 | 20   |
| 1.129 | 30   |
| 1.179 | 40.1 |

#### `platoToSG(plato: number): number`

Converts degrees Plato to specific gravity. Uses the same sucrose-solution fit as `brixToSG`.

| Plato | SG    |
|-------|-------|
| 0     | 1.000 |
| 12    | 1.048 |
| 20    | 1.083 |

#### `sgToPlato(sg: number): number`

Converts specific gravity to degrees Plato (ASBC-fit cubic). This is not the same polynomial as `sgToBrix`, so the two will not always agree.

| SG    | Plato |
|-------|-------|
| 1.000 | 0     |
| 1.048 | 11.9  |
| 1.083 | 20    |

#### `sgToPoints(sg: number): number` / `pointsToSG(points: number): number`

Gravity points are `(SG − 1) × 1000`.

| SG    | Points |
|-------|--------|
| 1.000 | 0      |
| 1.040 | 40     |
| 1.083 | 83     |

### Fermentation

#### `abv(og: number, fg: number): number`

Standard homebrew estimate: `(OG − FG) × 131.25`.

| OG    | FG    | ABV |
|-------|-------|-----|
| 1.050 | 1.050 | 0   |
| 1.050 | 1.010 | 5.3 |
| 1.060 | 1.012 | 6.3 |

#### `abvAlternate(og: number, fg: number): number`

Hall / Brewer's Friend alternate. Typically a bit higher than `abv` on bigger beers.

| OG    | FG    | ABV |
|-------|-------|-----|
| 1.050 | 1.010 | 5.3 |
| 1.060 | 1.012 | 6.5 |

#### `apparentAttenuation(og: number, fg: number): number`

`(OG − FG) / (OG − 1) × 100`. Returns `0` when OG is `1`.

| OG    | FG    | Attenuation |
|-------|-------|-------------|
| 1.050 | 1.050 | 0           |
| 1.050 | 1.010 | 80          |

### Hydrometer

#### `correctHydrometerSG(sg: number, sampleTempF: number, calibrationTempF?: number): number`

Corrects a hydrometer reading for sample temperature. Temperatures are in °F. Calibration defaults to **60 °F**; pass `68` for a 20 °C instrument.

| SG    | Sample | Cal | Corrected |
|-------|--------|-----|-----------|
| 1.050 | 60 °F  | 60  | 1.050     |
| 1.050 | 68 °F  | 68  | 1.050     |
| 1.050 | 80 °F  | 60  | 1.052     |

### Predicted gravity

#### `predictedOG(fermentables, efficiencyPercent, batchGal): number`

Points / PPG method. Mash and steep grains use `efficiencyPercent`; late boil sugars (`lateAddition: true`) count at 100% efficiency. Divide by post-boil / into-fermentor `batchGal`.

`PPG ≈ extractPercent / 100 × 46` (sucrose) when `ppg` is omitted. Explicit `ppg` wins if both are set.

| Mash | Late sugar | Eff | Gal | OG    |
|------|------------|-----|-----|-------|
| —    | —          | 75  | 5   | 1.000 |
| 10 lb × 36 PPG | — | 75 | 5 | 1.054 |
| —    | 1 lb × 46 PPG | 0 | 5 | 1.009 |
| 10 lb × 36 PPG | 1 lb × 46 PPG | 75 | 5 | 1.063 |
| 10 lb × 80% extract | — | 75 | 5 | 1.055 |

Related: `extractPercentToPPG(extractPercent)` and `fermentablePoints(amountLb, ppg)`.

#### `predictedFG(og, attenuationPercent): number`

`fg_points = og_points × (1 − attenuation%)`.

| OG    | Attn | FG    |
|-------|------|-------|
| 1.050 | 0    | 1.050 |
| 1.050 | 80   | 1.010 |
| 1.060 | 70   | 1.018 |
| 1.080 | 75   | 1.020 |

### IBU

Tinseth (1997). **`preBoilSG` is pre-boil specific gravity** (Brewfather-like) — not mid-boil or predicted OG. Dry hop contributes **0 IBU**.

Form factors are explicit: `pellet` 1.1, `whole` 1.0, `plug` 1.02 (BeerSmith-style), **`cryo` = pellet 1.1** for MVP (Cryo already carries higher AA% on the label). Default form is `pellet`. Optional `hopUtilizationFactor` (default `1`) is an equipment multiplier.

Whirlpool / hopstand: Tinseth time factor at contact minutes × a **linear** temp factor (`1.0` at `212°F`, `0.15` at `170°F`, clamp outside that band).

#### `tinsethIBU(hops, preBoilSG, volumeL, hopUtilizationFactor?): number`

Mass in grams, volume in liters, alpha acid as a percent (e.g. `6`), whirlpool temperature in °F.

| Addition | Pre-boil | L  | IBU |
|----------|----------|----|-----|
| 30 g, 6% AA, 60 min boil, whole | 1.040 | 20 | 22.7 |
| same, pellet | 1.040 | 20 | 25 |
| 30 g, 6% AA, 20 min whirlpool @ 212 °F, whole | 1.040 | 20 | 13.8 |
| same whirlpool @ 170 °F | 1.040 | 20 | 2.1 |
| dry hop | 1.040 | 20 | 0 |

Related: `tinsethUtilization(preBoilSG, timeMin)`, `whirlpoolTempFactor(tempF)`, `hopFormFactor(form)`.

### Color

#### `maltColorUnits(colorLovibond, amountLb, batchGal): number` / `moreySRM(mcu): number`

`MCU = (°L × lb) / gal`. Morey: `SRM = 1.4922 × MCU^0.6859`.

| MCU | SRM  |
|-----|------|
| 0   | 0    |
| 1   | 1.5  |
| 10  | 7.2  |
| 16  | 10   |
| 50  | 21.8 |

#### `srmToEBC(srm): number`

`EBC ≈ SRM × 1.97`.

| SRM | EBC  |
|-----|------|
| 7.2 | 14.2 |
| 10  | 19.7 |

### Volume

Thin numerics only — no vessel deadspace or 3-vessel pipeline. Shrinkage defaults to **4%**. Strike temperature is °F. Palmer: `strike_F = (0.2 / qt_per_lb) × (target_F − grain_F) + target_F`.

| Call | Result |
|------|--------|
| `boilOffGal(1.25, 1)` | 1.25 |
| `applyShrinkage(5)` | 4.8 |
| `undoShrinkage(5)` | 5.208 |
| `grainAbsorptionGal(12, 0.12)` | 1.44 |
| `strikeTemperatureF(152, 70, 1.25)` | 165.1 |

### Water

Kolbach residual alkalinity, Troester/Braukaiser mash pH (RA + grain acidity from color — **not** deLange), salt ion yields, lactic acidification, and RO/diluent blend. Ions are Ca, Mg, Na, Cl, SO₄, alkalinity as CaCO₃ (ppm).

Salt hydrates are explicit in the API. **Calcium chloride is `CaCl₂·2H₂O`** (anhydrous is not assumed). Yields are **ppm Δ per gram per US gallon** (Ken Schwartz / Palmer). `saltIonDeltaPerGramPerLiter` is the SI helper. Lactic **strength % is always an argument** (default **88**). Phosphoric, NaCl, pickling lime, and deLange are out of v1.

Chalk (`CaCO₃`) Δions are the stoichiometric table values (dissolve-with-CO₂ / mash-acid path), not the half-alkalinity spreadsheet hack.

#### `residualAlkalinity(ions): number`

`RA = alkalinity − (Ca/3.5 + Mg/7)` (ppm as CaCO₃). Ca and Mg are ion ppm.

| Ca | Mg | Alk | RA   |
|----|----|-----|------|
| 0  | 0  | 0   | 0    |
| 50 | 10 | 50  | 34.3 |
| 100| 20 | 200 | 168.6|
| 140| 10 | 20  | -21.4|

#### `saltIonDelta(salt, grams, gallons): WaterIons`

| Salt (1 g / 1 gal) | Formula | Δions |
|--------------------|---------|-------|
| `gypsum` | CaSO₄·2H₂O | Ca 61.5, SO₄ 147.4 |
| `calciumChloride` | CaCl₂·2H₂O | Ca 72.0, Cl 127.4 |
| `epsom` | MgSO₄·7H₂O | Mg 26.1, SO₄ 103.0 |
| `bakingSoda` | NaHCO₃ | Na 72.3, alk 157.4 |
| `chalk` | CaCO₃ | Ca 105.8, alk 264.2 |

#### `lacticAlkalinityDrop(ml, gallons, strengthPercent?): number`

| Call | Result |
|------|--------|
| `lacticAlkalinityDrop(1, 1, 88)` | 155.6 |
| `lacticAlkalinityDrop(2, 5, 88)` | 62.2 |
| `lacticAlkalinityDrop(1, 1, 44)` | 77.8 |

Related: `applyLactic`, `lacticAlkalinityDropSI`.

#### `troesterMashPH(raPpm, colorSRM, thicknessLPerKg?, roastedFraction?): number`

DI mash pH `5.6` plus Braukaiser color shift `−(SRM × (0.21·(1−roast) + 0.06·roast)) / 12`, then RA × `spH` where `spH = 0.013·R + 0.013`. Default thickness **4 L/kg**. `roastedFraction` `0` = all crystal/non-roast.

| Call | Result |
|------|--------|
| `troesterMashPH(0, 2)` | 5.57 |
| `troesterMashPH(0, 10)` | 5.43 |
| `estimatedMashPH({ca: 50, mg: 10, na: 0, cl: 0, so4: 0, alkalinity: 50}, 2)` | 5.61 |
| `troesterMashPH(178, 2)` | 5.80 |

Related: `estimatedMashPH(ions, colorSRM, …)`, `blendWater(source, fractionTowardDiluent, diluent?)` (omitted diluent = RO/DI zeros).

## Development

Source lives in `src/`. Compiled CommonJS and type declarations are emitted to `lib/`.

```bash
npm test        # Jest via ts-jest
npm run build   # tsc → lib/
```

## License

[ISC](./LICENSE)
