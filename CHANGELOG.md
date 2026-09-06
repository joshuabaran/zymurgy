# Changelog

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

- Current npm release (published while the package was private)
