import {describe, expect, test} from '@jest/globals'
import {
  applyShrinkage,
  boilOffGal,
  grainAbsorptionGal,
  strikeTemperatureF,
  undoShrinkage,
} from './volume'

describe('boilOffGal', () => {
  test('returns 0 for a 0 hour boil', () => {
    expect(boilOffGal(1.25, 0)).toBe(0)
  })
  test('returns the hourly rate after 1 hour', () => {
    expect(boilOffGal(1.25, 1)).toBe(1.25)
  })
  test('scales a 1.5 hour boil', () => {
    expect(boilOffGal(1.25, 1.5)).toBe(1.875)
  })
})

describe('applyShrinkage', () => {
  test('returns 0 for no volume', () => {
    expect(applyShrinkage(0)).toBe(0)
  })
  test('applies 4% shrinkage by default', () => {
    expect(applyShrinkage(5)).toBe(4.8)
  })
  test('accepts an explicit shrinkage fraction', () => {
    expect(applyShrinkage(5, 0)).toBe(5)
  })
})

describe('undoShrinkage', () => {
  test('expands a cold 5 gal volume by the default 4%', () => {
    expect(undoShrinkage(5)).toBe(5.208)
  })
  test('is the inverse of applyShrinkage at 4%', () => {
    expect(undoShrinkage(applyShrinkage(6.5))).toBe(6.5)
  })
})

describe('grainAbsorptionGal', () => {
  test('returns 0 for no grain', () => {
    expect(grainAbsorptionGal(0, 0.12)).toBe(0)
  })
  test('multiplies grain weight by the absorption rate', () => {
    expect(grainAbsorptionGal(12, 0.12)).toBe(1.44)
  })
})

describe('strikeTemperatureF', () => {
  test('returns the mash target when grain is already at rest temperature', () => {
    expect(strikeTemperatureF(152, 152, 1.25)).toBe(152)
  })
  test('estimates 165.1 F at 1.25 qt/lb from 70 F grain to 152 F', () => {
    expect(strikeTemperatureF(152, 70, 1.25)).toBe(165.1)
  })
  test('estimates 162.9 F at 1.5 qt/lb from 70 F grain to 152 F', () => {
    expect(strikeTemperatureF(152, 70, 1.5)).toBe(162.9)
  })
})
