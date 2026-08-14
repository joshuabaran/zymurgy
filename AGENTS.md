# AGENTS.md

`@jbaran/zymurgy` is a small TypeScript library of beer and wine fermentation utilities. It has no runtime dependencies.

## Layout

- Edit `src/` only. `src/index.ts` is the public entry and re-exports modules.
- `lib/` is compiled CommonJS + `.d.ts` output (`package.json` `"main"` is `./lib/index.js`). It is committed; do not hand-edit it.
- Colocate tests next to the code they cover as `*.test.ts`. Tests are excluded from `tsc`.

## Commands

```bash
npm test          # jest via ts-jest (node)
npm run build     # tsc → lib/
```

After changing `src/`, run tests. If the public API or emitted JS/types change, run `npm run build` and include the updated `lib/` files.

## Code conventions

- TypeScript, `strict: true`, target ES2016, CommonJS.
- Named exports only. Keep functions pure and synchronous.
- Match existing style in the file you edit (2-space indent). `src/*.ts` uses semicolons; tests generally omit them and use single quotes.
- Round conversion results with `Number(x.toFixed(n))`: specific gravity to 3 decimal places, Brix/Plato to 1, gravity points to 0, ABV and apparent attenuation to 1. Use `|| 0` where `sgToBrix` / `sgToPlato` do, so tiny negative residuals become `0`.
- Do not add a bundler, linter, formatter, or runtime dependency unless the task requires it.
- Leave the leftover `echo` script in `package.json` unless you are asked to clean scripts.

## Domain

These are brewing estimates, not lab-grade measurements. Prefer established brewing formulas and document the source in a short comment when adding a new one.

Current public API:

- `brixToSG(brix)` / `sgToBrix(sg)`
- `platoToSG(plato)` / `sgToPlato(sg)`
- `sgToPoints(sg)` / `pointsToSG(points)`
- `abv(og, fg)` / `abvAlternate(og, fg)` / `apparentAttenuation(og, fg)`
- `correctHydrometerSG(sg, sampleTempF, calibrationTempF = 60)`

Related conversions are not exact inverses at every tested point (e.g. `sgToBrix(1.179)` is `40.1`, not `40`; `sgToPlato(1.048)` is `11.9`). Do not “fix” that unless asked; update tests if you intentionally change rounding or the formula.

`platoToSG` must call `brixToSG`. `sgToPlato` uses a different reverse polynomial than `sgToBrix` and must not share that implementation. Hydrometer temperatures are °F only.

## Tests

- Jest + `ts-jest`, `@jest/globals` imports (`describe` / `test` / `expect`).
- Assert the rounded public return values with `toBe`.
- Cover the same style of representative points used today (0 / low / mid / high), plus any new edge the formula defines.

## Scope

Keep this a focused estimation library. New helpers belong in a dedicated `src/` module and must be re-exported from `src/index.ts`.
