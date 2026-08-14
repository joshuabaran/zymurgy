import {describe, expect, test} from '@jest/globals'
import { brixToSG, sgToBrix, platoToSG, sgToPlato, sgToPoints, pointsToSG } from './conversions'

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

describe('platoToSG', () => {
  test('converts 0 Plato to 1.000 SG', () => {
    expect(platoToSG(0)).toBe(1.000)
  })
  test('converts 12 Plato to 1.048 SG', () => {
    expect(platoToSG(12)).toBe(1.048)
  })
  test('converts 20 Plato to 1.083 SG', () => {
    expect(platoToSG(20)).toBe(1.083)
  })
  test('matches brixToSG for the same reading', () => {
    expect(platoToSG(10)).toBe(brixToSG(10))
    expect(platoToSG(20)).toBe(brixToSG(20))
    expect(platoToSG(40)).toBe(brixToSG(40))
  })
})

describe('sgToPlato', () => {
  test('converts 1.000 SG to 0 Plato', () => {
    expect(sgToPlato(1.000)).toBe(0)
  })
  test('converts 1.048 SG to 11.9 Plato', () => {
    expect(sgToPlato(1.048)).toBe(11.9)
  })
  test('converts 1.083 SG to 20 Plato', () => {
    expect(sgToPlato(1.083)).toBe(20)
  })
})

describe('sgToPoints', () => {
  test('converts 1.000 SG to 0 points', () => {
    expect(sgToPoints(1.000)).toBe(0)
  })
  test('converts 1.040 SG to 40 points', () => {
    expect(sgToPoints(1.040)).toBe(40)
  })
  test('converts 1.083 SG to 83 points', () => {
    expect(sgToPoints(1.083)).toBe(83)
  })
})

describe('pointsToSG', () => {
  test('converts 0 points to 1.000 SG', () => {
    expect(pointsToSG(0)).toBe(1.000)
  })
  test('converts 40 points to 1.040 SG', () => {
    expect(pointsToSG(40)).toBe(1.040)
  })
  test('converts 83 points to 1.083 SG', () => {
    expect(pointsToSG(83)).toBe(1.083)
  })
})
