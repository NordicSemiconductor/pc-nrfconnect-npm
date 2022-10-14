/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType, getRange } from './helpers'

const steps1Range: RangeType = {
    min: 3.50,
    max: 3.65,
    step: 0.05,
}

const steps2Range: RangeType = {
    min: 4.00,
    max: 4.45,
    step: 0.05,
}

const vTermValues = getRange([steps1Range, steps2Range]).map((v) => Number(v.toFixed(2)))

export default vTermValues;
