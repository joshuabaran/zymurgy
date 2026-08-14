import {describe, expect, test} from '@jest/globals'
import { abv, abvAlternate, apparentAttenuation } from './fermentation'

describe('abv', () => {
  test('returns 0 when OG equals FG', () => {
    expect(abv(1.050, 1.050)).toBe(0)
  })
  test('estimates 5.3% for a 1.050 / 1.010 ale', () => {
    expect(abv(1.050, 1.010)).toBe(5.3)
  })
  test('estimates 6.3% for a 1.060 / 1.012 ale', () => {
    expect(abv(1.060, 1.012)).toBe(6.3)
  })
})

describe('abvAlternate', () => {
  test('returns 0 when OG equals FG', () => {
    expect(abvAlternate(1.050, 1.050)).toBe(0)
  })
  test('estimates 5.3% for a 1.050 / 1.010 ale', () => {
    expect(abvAlternate(1.050, 1.010)).toBe(5.3)
  })
  test('estimates 6.5% for a 1.060 / 1.012 ale', () => {
    expect(abvAlternate(1.060, 1.012)).toBe(6.5)
  })
})

describe('apparentAttenuation', () => {
  test('returns 0 when OG equals FG', () => {
    expect(apparentAttenuation(1.050, 1.050)).toBe(0)
  })
  test('returns 80% for a 1.050 / 1.010 ale', () => {
    expect(apparentAttenuation(1.050, 1.010)).toBe(80)
  })
  test('returns 0 when OG is 1.000', () => {
    expect(apparentAttenuation(1, 1)).toBe(0)
  })
})
