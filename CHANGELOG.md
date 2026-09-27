# Changelog

## 1.5.0

- **Fix `residualAlkalinity`**: it applied Kolbach's hardness-as-CaCO₃ divisors (`Ca/3.5 + Mg/7`) to ion ppm, understating the Ca/Mg effect by ~2.5×. It now uses Palmer's ion-ppm form `alkalinity − (Ca/1.4 + Mg/1.7)`. RA is lower (often much lower) for any water with Ca or Mg, and `estimatedMashPH` drops with it. Example: Ca 50, Mg 10, alk 50 was 34.3 and is now 8.4.
- `applySalts` and `applyLactic` round once at the end instead of after each step
- Exported constants (`RO_WATER`, `SALT_PPM_PER_G_PER_GAL`, `WATER_SALT_FORMULA`, `HOP_FORM_FACTOR`) are frozen and typed read-only
- `tsconfig.tsbuildinfo` is no longer shipped in the npm tarball
- CI runs on Node 26 with `actions/checkout@v7` and `actions/setup-node@v7`. The publish job no longer restores the npm cache
- `jest` and `@jest/globals` are explicit devDependencies
- Source comments cite primary formula sources

## 1.4.0

- Water chemistry helpers: ions, salt → Δions, lactic acidification, Kolbach RA, Troester/Braukaiser mash pH, dilution/blend
- Salt hydrates are explicit (`NaHCO₃`, `CaSO₄·2H₂O`, **`CaCl₂·2H₂O` default**, `MgSO₄·7H₂O`, `CaCO₃`). Anhydrous CaCl₂ is not assumed
- Lactic is required; strength % is always an API argument (default **88**). Phosphoric is parked
- Ion yields are **ppm Δ per gram per US gallon** (Ken Schwartz / Palmer table). SI per-g-per-L helpers are included
- Mash pH v1 is Troester/Braukaiser (RA + grain acidity from color). Not deLange charge-balance

Locked defaults:

1. **Kolbach RA** (ppm as CaCO₃) = `alkalinity − (Ca/3.5 + Mg/7)`. Ca and Mg are ion ppm. *(Incorrect for ion ppm; fixed in 1.5.0.)*
2. **Troester mash pH** uses DI mash pH `5.6` plus the Braukaiser color shift and `spH = 0.013·R + 0.013` (default thickness **4 L/kg**). Color roasted fraction `0` = all crystal/non-roast.
3. **Calcium chloride = dihydrate**. **Lactic strength is an argument** (default 88%).

Parked: NaCl, pickling lime, phosphoric, deLange, anhydrous CaCl₂ as default.

## 1.3.0

- Predicted OG (points / PPG method), including `% extract → PPG` via sucrose ~46
- Predicted FG from OG and yeast attenuation %
- Tinseth IBU plus a simplified whirlpool/hopstand util; dry hop = 0 IBU
- Morey SRM from MCU, with an optional `srmToEBC` helper
- Thin volume helpers: boil-off, shrinkage (default 4%), grain absorption, Palmer strike temperature

Locked defaults (also documented on the IBU module):

1. **Tinseth gravity input = pre-boil SG** (Brewfather-like). The parameter is `preBoilSG`; callers pass that SG.
2. **Whirlpool temp→util** is linear: factor `1.0` at `212°F`, `0.15` at `170°F`, clamp outside that band; multiply the Tinseth time factor at contact minutes.
3. **Cryo form factor = pellet (`1.1`)** for MVP (Cryo already carries higher AA% on the label). Forms are explicit: `pellet | whole | plug | cryo`.

## 1.2.1

- Add a LICENSE file (ISC, Copyright Joshua Baran)
- Add `publishConfig.access: public` so a later npm flip stays public
- Limit the published tarball to `lib/` (`files`)
- Add package keywords
- Remove the leftover `echo` script

## 1.2.0

- Published while the package was private
