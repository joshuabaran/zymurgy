import {describe, expect, test} from '@jest/globals'
import { brixToSG, sgToBrix } from './conversions'

describe('brixToSG', () => {
  test('converts 0 Brix to 1.000 SG', () => {
    expect(brixToSG(0)).toBe(1.000)
  })
  test('converts 1 Brix to 1.004 SG', () => {
    expect(brixToSG(1)).toBe(1.004)
  })
  test('converts 10 Brix to 1.040 SG', () => {
    expect(brixToSG(10)).toBe(1.040)
  })
  test('converts 20 Brix to 1.083 SG', () => {
    expect(brixToSG(20)).toBe(1.083)
  })
  test('converts 30 Brix to 1.129 SG', () => {
    expect(brixToSG(30)).toBe(1.129)
  })
  test('converts 40 Brix to 1.179 SG', () => {
    expect(brixToSG(40)).toBe(1.179)
  })
})

describe('sgToBrix', () => {
  test('converts 1.000 SG to 0 Brix', () => {
    expect(sgToBrix(1.000)).toBe(0)
  })
  test('converts 1.004 SG to 1 Brix', () => {
    expect(sgToBrix(1.004)).toBe(1)
  })
  test('converts 1.040 SG to 10 Brix', () => {
    expect(sgToBrix(1.040)).toBe(10)
  })
  test('converts 1.083 SG to 20 Brix', () => {
    expect(sgToBrix(1.083)).toBe(20)
  })
  test('converts 1.129 SG to 30 Brix', () => {
    expect(sgToBrix(1.129)).toBe(30)
  })
  test('converts 1.179 SG to 40 Brix', () => {
    expect(sgToBrix(1.179)).toBe(40.1)
  })
})
