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
```

These are brewing estimates, not lab-grade measurements. Specific gravity is rounded to 3 decimal places, Brix and Plato to 1, gravity points to the nearest integer, and ABV / attenuation to 1 decimal. Related conversions are not always exact inverses.

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

## Development

Source lives in `src/`. Compiled CommonJS and type declarations are emitted to `lib/`.

```bash
npm test        # Jest via ts-jest
npm run build   # tsc → lib/
```

## License

[ISC](./LICENSE)
