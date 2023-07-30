import {describe, expect, test} from '@jest/globals'
import { brixToSG } from './index'

describe('brixToSG', () => {
  test('converts 0 Brix to 1.000 SG', () => {
    expect(brixToSG(0)).toBe(1.000)
  })
  test('converts 1 Brix to 1.004 SG', () => {
    expect(brixToSG(1)).toBe(1.004)
  })
})
