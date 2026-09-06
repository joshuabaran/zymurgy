import {describe, expect, test} from '@jest/globals'
import { predictedFG } from './fg'

describe('predictedFG', () => {
  test('returns OG when attenuation is 0', () => {
    expect(predictedFG(1.050, 0)).toBe(1.050)
  })
  test('estimates 1.010 for a 1.050 wort at 80% attenuation', () => {
    expect(predictedFG(1.050, 80)).toBe(1.010)
  })
  test('estimates 1.018 for a 1.060 wort at 70% attenuation', () => {
    expect(predictedFG(1.060, 70)).toBe(1.018)
  })
  test('estimates 1.020 for a 1.080 wort at 75% attenuation', () => {
    expect(predictedFG(1.080, 75)).toBe(1.020)
  })
  test('returns 1.000 when OG is 1.000', () => {
    expect(predictedFG(1.000, 80)).toBe(1.000)
  })
})
