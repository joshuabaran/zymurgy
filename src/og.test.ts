import {describe, expect, test} from '@jest/globals'
import { extractPercentToPPG, fermentablePoints, predictedOG, SUCROSE_PPG } from './og'

describe('extractPercentToPPG', () => {
  test('converts 0% extract to 0 PPG', () => {
    expect(extractPercentToPPG(0)).toBe(0)
  })
  test('converts 80% extract via sucrose 46 PPG', () => {
    expect(extractPercentToPPG(80)).toBe(36.8)
  })
  test('converts 100% extract to sucrose PPG', () => {
    expect(extractPercentToPPG(100)).toBe(SUCROSE_PPG)
  })
})

describe('fermentablePoints', () => {
  test('returns 0 for no mass', () => {
    expect(fermentablePoints(0, 36)).toBe(0)
  })
  test('multiplies pounds by PPG', () => {
    expect(fermentablePoints(10, 36)).toBe(360)
  })
})

describe('predictedOG', () => {
  test('returns 1.000 with no fermentables', () => {
    expect(predictedOG([], 75, 5)).toBe(1.000)
  })
  test('returns 1.000 when mash efficiency is 0 and there are no late sugars', () => {
    expect(predictedOG([{ amountLb: 10, ppg: 36 }], 0, 5)).toBe(1.000)
  })
  test('estimates 1.054 for 10 lb at 36 PPG, 75% eff, 5 gal', () => {
    expect(predictedOG([{ amountLb: 10, ppg: 36 }], 75, 5)).toBe(1.054)
  })
  test('counts late sugars at 100% efficiency', () => {
    expect(predictedOG([{ amountLb: 1, ppg: 46, lateAddition: true }], 0, 5)).toBe(1.009)
  })
  test('adds mash points and late sugar points', () => {
    expect(predictedOG([
      { amountLb: 10, ppg: 36 },
      { amountLb: 1, ppg: 46, lateAddition: true },
    ], 75, 5)).toBe(1.063)
  })
  test('converts extract percent when PPG is omitted', () => {
    expect(predictedOG([{ amountLb: 10, extractPercent: 80 }], 75, 5)).toBe(1.055)
  })
  test('prefers explicit PPG over extract percent', () => {
    expect(predictedOG([{ amountLb: 10, ppg: 36, extractPercent: 80 }], 75, 5)).toBe(1.054)
  })
  test('estimates 1.081 for a bigger 5.5 gal mash', () => {
    expect(predictedOG([{ amountLb: 15, ppg: 37 }], 80, 5.5)).toBe(1.081)
  })
  test('returns 1 when batch volume is 0', () => {
    expect(predictedOG([{ amountLb: 10, ppg: 36 }], 75, 0)).toBe(1)
  })
})
