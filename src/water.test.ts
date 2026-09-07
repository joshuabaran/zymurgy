import {describe, expect, test} from '@jest/globals'
import {
  DEFAULT_LACTIC_STRENGTH_PERCENT,
  LITERS_PER_US_GAL,
  RO_WATER,
  SALT_PPM_PER_G_PER_GAL,
  WATER_SALT_FORMULA,
  addIons,
  applyLactic,
  applySalts,
  blendWater,
  estimatedMashPH,
  lacticAlkalinityDrop,
  lacticAlkalinityDropSI,
  residualAlkalinity,
  saltIonDelta,
  saltIonDeltaPerGramPerLiter,
  troesterColorPhShift,
  troesterMashPH,
  troesterRaPhSlope,
} from './water'

describe('WATER_SALT_FORMULA', () => {
  test('keeps hydrates explicit', () => {
    expect(WATER_SALT_FORMULA.bakingSoda).toBe('NaHCO3')
    expect(WATER_SALT_FORMULA.gypsum).toBe('CaSO4·2H2O')
    expect(WATER_SALT_FORMULA.calciumChloride).toBe('CaCl2·2H2O')
    expect(WATER_SALT_FORMULA.epsom).toBe('MgSO4·7H2O')
    expect(WATER_SALT_FORMULA.chalk).toBe('CaCO3')
  })
})

describe('saltIonDelta', () => {
  test('returns the Schwartz/Palmer 1 g per gal gypsum golden', () => {
    expect(saltIonDelta('gypsum', 1, 1)).toEqual({
      ca: 61.5,
      mg: 0,
      na: 0,
      cl: 0,
      so4: 147.4,
      alkalinity: 0,
    })
  })
  test('returns the dihydrate CaCl2 1 g per gal golden', () => {
    expect(saltIonDelta('calciumChloride', 1, 1)).toEqual({
      ca: 72,
      mg: 0,
      na: 0,
      cl: 127.4,
      so4: 0,
      alkalinity: 0,
    })
  })
  test('does not treat calcium chloride as anhydrous (~95.4 ppm Ca)', () => {
    expect(SALT_PPM_PER_G_PER_GAL.calciumChloride.ca).toBe(72)
    expect(SALT_PPM_PER_G_PER_GAL.calciumChloride.ca).not.toBe(95.4)
  })
  test('returns the Epsom 1 g per gal golden', () => {
    expect(saltIonDelta('epsom', 1, 1)).toEqual({
      ca: 0,
      mg: 26.1,
      na: 0,
      cl: 0,
      so4: 103,
      alkalinity: 0,
    })
  })
  test('returns the baking soda 1 g per gal golden', () => {
    expect(saltIonDelta('bakingSoda', 1, 1)).toEqual({
      ca: 0,
      mg: 0,
      na: 72.3,
      cl: 0,
      so4: 0,
      alkalinity: 157.4,
    })
  })
  test('returns the chalk 1 g per gal golden', () => {
    expect(saltIonDelta('chalk', 1, 1)).toEqual({
      ca: 105.8,
      mg: 0,
      na: 0,
      cl: 0,
      so4: 0,
      alkalinity: 264.2,
    })
  })
  test('scales 2 g gypsum in 5 gal', () => {
    expect(saltIonDelta('gypsum', 2, 5)).toEqual({
      ca: 24.6,
      mg: 0,
      na: 0,
      cl: 0,
      so4: 59,
      alkalinity: 0,
    })
  })
  test('returns zeros when gallons is 0', () => {
    expect(saltIonDelta('gypsum', 1, 0)).toEqual(RO_WATER)
  })
  test('returns zeros for 0 g', () => {
    expect(saltIonDelta('gypsum', 0, 5)).toEqual(RO_WATER)
  })
})

describe('saltIonDeltaPerGramPerLiter', () => {
  test('scales the gal table by liters per US gallon', () => {
    expect(saltIonDeltaPerGramPerLiter('gypsum').ca).toBe(232.8)
    expect(saltIonDeltaPerGramPerLiter('gypsum').so4).toBe(558)
  })
})

describe('residualAlkalinity', () => {
  test('is 0 for RO/DI', () => {
    expect(residualAlkalinity(RO_WATER)).toBe(0)
  })
  test('is 0 when alkalinity is 0 and there is no Ca or Mg', () => {
    expect(residualAlkalinity({ca: 0, mg: 0, na: 10, cl: 10, so4: 10, alkalinity: 0})).toBe(0)
  })
  test('Dirt Wolf Kolbach golden: Ca 50, Mg 10, alk 50 → 34.3', () => {
    expect(residualAlkalinity({ca: 50, mg: 10, na: 0, cl: 0, so4: 0, alkalinity: 50})).toBe(34.3)
  })
  test('Dirt Wolf Kolbach golden: Ca 100, Mg 20, alk 200 → 168.6', () => {
    expect(residualAlkalinity({ca: 100, mg: 20, na: 0, cl: 0, so4: 0, alkalinity: 200})).toBe(168.6)
  })
  test('goes negative when Ca/Mg exceed alkalinity', () => {
    expect(residualAlkalinity({ca: 140, mg: 10, na: 0, cl: 0, so4: 0, alkalinity: 20})).toBe(-21.4)
  })
  test('is alkalinity when Ca and Mg are 0', () => {
    expect(residualAlkalinity({ca: 0, mg: 0, na: 0, cl: 0, so4: 0, alkalinity: 100})).toBe(100)
  })
  test('is -20 when Ca is 70 and alkalinity is 0', () => {
    expect(residualAlkalinity({ca: 70, mg: 0, na: 0, cl: 0, so4: 0, alkalinity: 0})).toBe(-20)
  })
})

describe('troesterMashPH', () => {
  test('Dirt Wolf / BYO golden: RA 0, 2 SRM, 4 L/kg, no roast → 5.57', () => {
    expect(troesterMashPH(0, 2)).toBe(5.57)
    expect(troesterColorPhShift(2)).toBeCloseTo(-0.035, 10)
  })
  test('is 5.60 for RA 0 and 0 SRM', () => {
    expect(troesterMashPH(0, 0)).toBe(5.6)
  })
  test('lowers DI mash pH for mid color with no roast', () => {
    expect(troesterMashPH(0, 10)).toBe(5.43)
  })
  test('roasted color is less acidic per SRM than crystal', () => {
    expect(troesterMashPH(0, 20, 4, 1)).toBe(5.5)
    expect(troesterMashPH(0, 20, 4, 0)).toBe(5.25)
  })
  test('Dirt Wolf ion/color golden: Ca 50, Mg 10, alk 50, 2 SRM, 4 L/kg → 5.61', () => {
    const ions = {ca: 50, mg: 10, na: 0, cl: 0, so4: 0, alkalinity: 50}
    expect(residualAlkalinity(ions)).toBe(34.3)
    expect(estimatedMashPH(ions, 2)).toBe(5.61)
  })
  test('10 °dH RA (178 ppm) at 4 L/kg raises 2 SRM mash pH to 5.80', () => {
    expect(troesterRaPhSlope(4)).toBeCloseTo(0.065, 10)
    expect(troesterMashPH(178, 2, 4)).toBe(5.8)
  })
  test('thicker mash damps the RA shift', () => {
    expect(troesterMashPH(50, 2, 2)).toBe(5.6)
    expect(troesterMashPH(50, 2, 4)).toBe(5.63)
  })
})

describe('blendWater', () => {
  const hard = {ca: 100, mg: 20, na: 40, cl: 60, so4: 80, alkalinity: 120}

  test('fraction 0 keeps the source', () => {
    expect(blendWater(hard, 0)).toEqual(hard)
  })
  test('fraction 1 toward omitted diluent is RO/DI zeros', () => {
    expect(blendWater(hard, 1)).toEqual(RO_WATER)
  })
  test('halves every ion toward RO', () => {
    expect(blendWater(hard, 0.5)).toEqual({
      ca: 50,
      mg: 10,
      na: 20,
      cl: 30,
      so4: 40,
      alkalinity: 60,
    })
  })
  test('blends toward an optional diluent profile', () => {
    const diluent = {ca: 20, mg: 0, na: 0, cl: 0, so4: 0, alkalinity: 0}
    expect(blendWater(hard, 0.25, diluent).ca).toBe(80)
  })
})

describe('lacticAlkalinityDrop', () => {
  test('defaults strength to 88%', () => {
    expect(DEFAULT_LACTIC_STRENGTH_PERCENT).toBe(88)
    expect(lacticAlkalinityDrop(1, 1)).toBe(lacticAlkalinityDrop(1, 1, 88))
  })
  test('1 mL of 88% lactic per gal drops 155.6 ppm as CaCO3', () => {
    expect(lacticAlkalinityDrop(1, 1, 88)).toBe(155.6)
  })
  test('scales with volume', () => {
    expect(lacticAlkalinityDrop(2, 5, 88)).toBe(62.2)
  })
  test('scales with strength', () => {
    expect(lacticAlkalinityDrop(1, 1, 44)).toBe(77.8)
  })
  test('returns 0 for 0 mL or 0 gal', () => {
    expect(lacticAlkalinityDrop(0, 1, 88)).toBe(0)
    expect(lacticAlkalinityDrop(1, 0, 88)).toBe(0)
  })
  test('SI helper is 589.1 ppm for 1 mL of 88% in 1 L', () => {
    expect(lacticAlkalinityDropSI(1, 1, 88)).toBe(589.1)
    expect(lacticAlkalinityDropSI(1, LITERS_PER_US_GAL, 88)).toBe(155.6)
  })
})

describe('applyLactic / applySalts', () => {
  test('subtracts lactic from alkalinity only', () => {
    const source = {ca: 50, mg: 10, na: 5, cl: 10, so4: 20, alkalinity: 200}
    expect(applyLactic(source, 1, 1, 88)).toEqual({
      ca: 50,
      mg: 10,
      na: 5,
      cl: 10,
      so4: 20,
      alkalinity: 44.4,
    })
  })
  test('adds gypsum to RO and drops RA', () => {
    const treated = applySalts(RO_WATER, [{salt: 'gypsum', grams: 1}], 1)
    expect(treated.ca).toBe(61.5)
    expect(treated.so4).toBe(147.4)
    expect(residualAlkalinity(treated)).toBe(-17.6)
  })
  test('addIons composes two deltas', () => {
    expect(addIons(saltIonDelta('gypsum', 1, 1), saltIonDelta('epsom', 1, 1))).toEqual({
      ca: 61.5,
      mg: 26.1,
      na: 0,
      cl: 0,
      so4: 250.4,
      alkalinity: 0,
    })
  })
})
