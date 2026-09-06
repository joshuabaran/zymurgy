import {describe, expect, test} from '@jest/globals'
import { maltColorUnits, moreySRM, srmToEBC } from './color'

describe('maltColorUnits', () => {
  test('returns 0 when there is no grain', () => {
    expect(maltColorUnits(10, 0, 5)).toBe(0)
  })
  test('is 16 for 8 lb at 10 L in 5 gal', () => {
    expect(maltColorUnits(10, 8, 5)).toBe(16)
  })
  test('returns 0 when batch volume is 0', () => {
    expect(maltColorUnits(10, 8, 0)).toBe(0)
  })
})

describe('moreySRM', () => {
  test('returns 0 for MCU 0', () => {
    expect(moreySRM(0)).toBe(0)
  })
  test('estimates 1.5 SRM at MCU 1', () => {
    expect(moreySRM(1)).toBe(1.5)
  })
  test('estimates 7.2 SRM at MCU 10', () => {
    expect(moreySRM(10)).toBe(7.2)
  })
  test('estimates 10 SRM at MCU 16', () => {
    expect(moreySRM(16)).toBe(10)
  })
  test('estimates 21.8 SRM at MCU 50', () => {
    expect(moreySRM(50)).toBe(21.8)
  })
})

describe('srmToEBC', () => {
  test('returns 0 for 0 SRM', () => {
    expect(srmToEBC(0)).toBe(0)
  })
  test('converts 7.2 SRM to 14.2 EBC', () => {
    expect(srmToEBC(7.2)).toBe(14.2)
  })
  test('converts 10 SRM to 19.7 EBC', () => {
    expect(srmToEBC(10)).toBe(19.7)
  })
})
