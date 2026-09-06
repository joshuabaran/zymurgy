import {describe, expect, test} from '@jest/globals'
import { hopFormFactor, tinsethIBU, tinsethUtilization, whirlpoolTempFactor } from './ibu'

describe('hopFormFactor', () => {
  test('uses 1.1 for pellet', () => {
    expect(hopFormFactor('pellet')).toBe(1.1)
  })
  test('uses 1.0 for whole', () => {
    expect(hopFormFactor('whole')).toBe(1)
  })
  test('uses 1.02 for plug', () => {
    expect(hopFormFactor('plug')).toBe(1.02)
  })
  test('treats cryo as pellet for MVP', () => {
    expect(hopFormFactor('cryo')).toBe(hopFormFactor('pellet'))
    expect(hopFormFactor('cryo')).toBe(1.1)
  })
})

describe('whirlpoolTempFactor', () => {
  test('is 1.0 at 212 F', () => {
    expect(whirlpoolTempFactor(212)).toBe(1)
  })
  test('is 0.15 at 170 F', () => {
    expect(whirlpoolTempFactor(170)).toBe(0.15)
  })
  test('is 0.575 at the 191 F midpoint', () => {
    expect(whirlpoolTempFactor(191)).toBe(0.575)
  })
  test('clamps below 170 F to 0.15', () => {
    expect(whirlpoolTempFactor(150)).toBe(0.15)
  })
  test('clamps above 212 F to 1.0', () => {
    expect(whirlpoolTempFactor(220)).toBe(1)
  })
})

describe('tinsethUtilization', () => {
  test('is 0 at 0 minutes', () => {
    expect(tinsethUtilization(1.040, 0)).toBe(0)
  })
  test('is 0.2524 for 1.040 pre-boil SG at 60 minutes', () => {
    expect(tinsethUtilization(1.040, 60)).toBe(0.2524)
  })
  test('is 0.1252 for 1.040 pre-boil SG at 15 minutes', () => {
    expect(tinsethUtilization(1.040, 15)).toBe(0.1252)
  })
  test('is higher in a 1.000 wort than a 1.080 wort', () => {
    expect(tinsethUtilization(1.000, 60)).toBe(0.3615)
    expect(tinsethUtilization(1.080, 60)).toBe(0.1762)
  })
})

describe('tinsethIBU', () => {
  const base = { massG: 30, alphaAcidPercent: 6, timeMin: 60, use: 'boil' as const }

  test('returns 0 with no hops', () => {
    expect(tinsethIBU([], 1.040, 20)).toBe(0)
  })
  test('returns 0 for dry hop', () => {
    expect(tinsethIBU([{ ...base, use: 'dryHop' }], 1.040, 20)).toBe(0)
  })
  test('returns 0 when volume is 0', () => {
    expect(tinsethIBU([{ ...base, form: 'whole' }], 1.040, 0)).toBe(0)
  })
  test('estimates 22.7 IBU for 30 g at 6% AA, 60 min, 20 L, whole, 1.040 pre-boil', () => {
    expect(tinsethIBU([{ ...base, form: 'whole' }], 1.040, 20)).toBe(22.7)
  })
  test('applies the 1.1 pellet form factor', () => {
    expect(tinsethIBU([{ ...base, form: 'pellet' }], 1.040, 20)).toBe(25)
  })
  test('defaults form to pellet', () => {
    expect(tinsethIBU([base], 1.040, 20)).toBe(25)
  })
  test('matches pellet when form is cryo', () => {
    expect(tinsethIBU([{ ...base, form: 'cryo' }], 1.040, 20)).toBe(25)
  })
  test('applies the 1.02 plug form factor', () => {
    expect(tinsethIBU([{ ...base, form: 'plug' }], 1.040, 20)).toBe(23.2)
  })
  test('estimates 11.3 IBU for a 15 minute whole addition', () => {
    expect(tinsethIBU([{ ...base, timeMin: 15, form: 'whole' }], 1.040, 20)).toBe(11.3)
  })
  test('treats a 212 F whirlpool like Tinseth time at contact minutes', () => {
    expect(tinsethIBU([{
      massG: 30,
      alphaAcidPercent: 6,
      timeMin: 20,
      use: 'whirlpool',
      form: 'whole',
      whirlpoolTempF: 212,
    }], 1.040, 20)).toBe(13.8)
  })
  test('defaults whirlpool temperature to 212 F', () => {
    expect(tinsethIBU([{
      massG: 30,
      alphaAcidPercent: 6,
      timeMin: 20,
      use: 'whirlpool',
      form: 'whole',
    }], 1.040, 20)).toBe(13.8)
  })
  test('scales a 170 F whirlpool by 0.15', () => {
    expect(tinsethIBU([{
      massG: 30,
      alphaAcidPercent: 6,
      timeMin: 20,
      use: 'whirlpool',
      form: 'whole',
      whirlpoolTempF: 170,
    }], 1.040, 20)).toBe(2.1)
  })
  test('scales a 191 F whirlpool by the midpoint factor', () => {
    expect(tinsethIBU([{
      massG: 30,
      alphaAcidPercent: 6,
      timeMin: 20,
      use: 'whirlpool',
      form: 'whole',
      whirlpoolTempF: 191,
    }], 1.040, 20)).toBe(7.9)
  })
  test('applies an equipment hop utilization factor', () => {
    expect(tinsethIBU([{ ...base, form: 'whole' }], 1.040, 20, 0.85)).toBe(19.3)
  })
  test('sums boil IBU and ignores a dry hop in the same bill', () => {
    expect(tinsethIBU([
      { ...base, form: 'whole' },
      { ...base, use: 'dryHop', timeMin: 4320 },
    ], 1.040, 20)).toBe(22.7)
  })
})
