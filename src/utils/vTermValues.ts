/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getRange, RangeType } from './helpers';

const steps1Range: RangeType = {
    min: 3.5,
    max: 3.65,
    step: 0.05,
};

const steps2Range: RangeType = {
    min: 4.0,
    max: 4.45,
    step: 0.05,
};

const vTermValues = getRange([steps1Range, steps2Range]).map(v =>
    Number(v.toFixed(2))
);

export default vTermValues;
