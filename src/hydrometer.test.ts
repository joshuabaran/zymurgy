import {describe, expect, test} from '@jest/globals'
import { correctHydrometerSG } from './hydrometer'

describe('correctHydrometerSG', () => {
  test('leaves SG unchanged when sample matches 60 F calibration', () => {
    expect(correctHydrometerSG(1.050, 60, 60)).toBe(1.050)
  })
  test('leaves SG unchanged when sample matches 68 F calibration', () => {
    expect(correctHydrometerSG(1.050, 68, 68)).toBe(1.050)
  })
  test('corrects a warm 80 F reading on a 60 F hydrometer', () => {
    expect(correctHydrometerSG(1.050, 80, 60)).toBe(1.052)
  })
  test('defaults calibration temperature to 60 F', () => {
    expect(correctHydrometerSG(1.050, 80)).toBe(1.052)
  })
})
