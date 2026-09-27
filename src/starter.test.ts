import {describe, expect, test} from '@jest/globals'
import {
  PITCH_RATE,
  STARTER_GROWTH_B_PER_G,
  dmeForGravity,
  liquidYeastViability,
  pitchRateFor,
  starterGravity,
  starterGrowth,
  starterGrowthPerGram,
  targetCells,
} from './starter'
import { predictedOG } from './og'

// 5 US gal of 1.050 wort: 18.927 L at 12.4 °P
const batchL = 18.927
const plato = 12.4

describe('PITCH_RATE', () => {
  test('has the homebrew presets in M cells / mL / °P', () => {
    expect(PITCH_RATE).toEqual({ ale: 0.75, highGravityAle: 1.0, lager: 1.5, highGravityLager: 2.0 })
  })
  test('is frozen', () => {
    expect(Object.isFrozen(PITCH_RATE)).toBe(true)
    expect(Object.isFrozen(STARTER_GROWTH_B_PER_G)).toBe(true)
  })
})

describe('targetCells', () => {
  test('needs 176 B for a 5 gal 1.050 ale', () => {
    expect(targetCells(PITCH_RATE.ale, batchL, plato)).toBe(176)
  })
  test('needs 352 B for the same wort as a lager', () => {
    expect(targetCells(PITCH_RATE.lager, batchL, plato)).toBe(352)
  })
  test('needs 0 for no volume', () => {
    expect(targetCells(PITCH_RATE.ale, 0, plato)).toBe(0)
  })
})

describe('pitchRateFor', () => {
  test('is the inverse of targetCells', () => {
    expect(pitchRateFor(targetCells(0.75, batchL, plato), batchL, plato)).toBe(0.75)
    expect(pitchRateFor(targetCells(1.5, batchL, plato), batchL, plato)).toBe(1.5)
  })
  test('gives 1.23 for 288 B in a 5 gal 1.050 batch', () => {
    expect(pitchRateFor(288, batchL, plato)).toBe(1.23)
  })
  test('returns 0 for no volume or no extract', () => {
    expect(pitchRateFor(100, 0, plato)).toBe(0)
    expect(pitchRateFor(100, batchL, 0)).toBe(0)
  })
  test('lets negative inputs run through the formula, like the other modules', () => {
    expect(targetCells(0.75, -5, 12.4)).toBe(-46.5)
    expect(pitchRateFor(-46.5, -5, 12.4)).toBe(0.75)
  })
})

describe('liquidYeastViability', () => {
  test('starts at 97%', () => {
    expect(liquidYeastViability(0)).toBe(97)
  })
  test('drops 0.7% per day', () => {
    expect(liquidYeastViability(30)).toBe(76)
    expect(liquidYeastViability(60)).toBe(55)
  })
  test('bottoms out at 0', () => {
    expect(liquidYeastViability(200)).toBe(0)
  })
  test('treats a future manufacture date as fresh', () => {
    expect(liquidYeastViability(-5)).toBe(97)
  })
  test('accepts a custom start and daily drop', () => {
    expect(liquidYeastViability(30, 100, 0.7)).toBe(79)
    expect(liquidYeastViability(90, 99, 0.1)).toBe(90)
  })
})

describe('dmeForGravity', () => {
  test('needs about 100 g per liter for 1.037', () => {
    expect(dmeForGravity(1.037, 1)).toBe(100.8)
    expect(dmeForGravity(1.037, 1.5)).toBe(151.1)
    expect(dmeForGravity(1.037, 2)).toBe(201.5)
  })
  test('needs none for water or no volume', () => {
    expect(dmeForGravity(1.000, 1)).toBe(0)
    expect(dmeForGravity(1.037, 0)).toBe(0)
  })
  test('uses a custom PPG', () => {
    expect(dmeForGravity(1.037, 1, 45)).toBe(98.5)
  })
})

describe('starterGravity', () => {
  test('gives 1.037 for 100 g in 1 L', () => {
    expect(starterGravity(100, 1)).toBe(1.037)
  })
  test('round-trips dmeForGravity', () => {
    expect(starterGravity(dmeForGravity(1.040, 2), 2)).toBe(1.040)
  })
  test('matches predictedOG for the same DME as a late addition', () => {
    expect(starterGravity(150, 1.5)).toBe(predictedOG([{ amountLb: 150 / 453.59237, ppg: 44, lateAddition: true }], 0, 1.5 / 3.785411784))
  })
  test('returns 1 for no volume', () => {
    expect(starterGravity(100, 0)).toBe(1)
  })
})

describe('starterGrowthPerGram', () => {
  test('stir plate is flat at 1.4 below 1.4 B/g', () => {
    expect(starterGrowthPerGram(0, 'stirPlate')).toBe(1.4)
    expect(starterGrowthPerGram(1.39, 'stirPlate')).toBe(1.4)
  })
  test('stir plate declines as 2.33 − 0.67 × rate from 1.4 B/g', () => {
    expect(starterGrowthPerGram(1.4, 'stirPlate')).toBe(1.392)
    expect(starterGrowthPerGram(2, 'stirPlate')).toBe(0.99)
    expect(starterGrowthPerGram(3, 'stirPlate')).toBe(0.32)
  })
  test('stir plate is clamped at 0 where the line crosses 0 (~3.48 B/g)', () => {
    expect(starterGrowthPerGram(3.47, 'stirPlate')).toBe(0.005)
    expect(starterGrowthPerGram(3.48, 'stirPlate')).toBe(0)
    expect(starterGrowthPerGram(3.5, 'stirPlate')).toBe(0)
  })
  test('shaken and still starters grow a flat rate up to 3.5 B/g', () => {
    expect(starterGrowthPerGram(0.5, 'shaken')).toBe(0.62)
    expect(starterGrowthPerGram(3.5, 'shaken')).toBe(0.62)
    expect(starterGrowthPerGram(0.5, 'none')).toBe(0.4)
    expect(starterGrowthPerGram(3.5, 'none')).toBe(0.4)
  })
  test('nothing grows above 3.5 B/g', () => {
    expect(starterGrowthPerGram(3.51, 'stirPlate')).toBe(0)
    expect(starterGrowthPerGram(3.51, 'shaken')).toBe(0)
    expect(starterGrowthPerGram(3.51, 'none')).toBe(0)
  })
})

describe('starterGrowth', () => {
  test('1 fresh pack in a 1 L stir plate starter reaches ~238 B', () => {
    expect(starterGrowth(97, 100.8, 'stirPlate')).toEqual({ inoculationRate: 0.96, grownB: 141.1, totalB: 238.1 })
  })
  test('a 30-day-old pack in a 1.5 L stir plate starter reaches ~288 B', () => {
    expect(starterGrowth(76, 151.1, 'stirPlate')).toEqual({ inoculationRate: 0.5, grownB: 211.5, totalB: 287.5 })
  })
  test('the same starter shaken grows less than half as much', () => {
    expect(starterGrowth(76, 151.1, 'shaken')).toEqual({ inoculationRate: 0.5, grownB: 93.7, totalB: 169.7 })
  })
  test('the same starter with no agitation', () => {
    expect(starterGrowth(76, 151.1, 'none')).toEqual({ inoculationRate: 0.5, grownB: 60.4, totalB: 136.4 })
  })
  test('a stir plate at 2 B/g grows on the declining line', () => {
    expect(starterGrowth(200, 100, 'stirPlate')).toEqual({ inoculationRate: 2, grownB: 99, totalB: 299 })
  })
  test('too many cells for the extract grow nothing', () => {
    expect(starterGrowth(400, 100, 'stirPlate')).toEqual({ inoculationRate: 4, grownB: 0, totalB: 400 })
  })
  test('rounds a halfway growth the same way in grownB and totalB', () => {
    // 0.62 × 127.5 = 79.05, and (2.33 − 0.67 × 60/35) × 35 = 41.35: halfway values in binary
    expect(starterGrowth(50, 127.5, 'shaken')).toEqual({ inoculationRate: 0.39, grownB: 79.1, totalB: 129.1 })
    expect(starterGrowth(60, 35, 'stirPlate')).toEqual({ inoculationRate: 1.71, grownB: 41.4, totalB: 101.4 })
  })
  test('totalB is always start + grownB for single-decimal starts', () => {
    for (const start of [12.3, 50, 76, 97, 110.5, 200]) {
      for (const grams of [35, 100.8, 127.5, 151.1, 201.5]) {
        for (const agitation of ['stirPlate', 'shaken', 'none'] as const) {
          const { grownB, totalB } = starterGrowth(start, grams, agitation)
          expect(totalB).toBe(Number((start + grownB).toFixed(1)))
        }
      }
    }
  })
  test('no extract means no growth', () => {
    expect(starterGrowth(97, 0, 'stirPlate')).toEqual({ inoculationRate: 0, grownB: 0, totalB: 97 })
  })
})
