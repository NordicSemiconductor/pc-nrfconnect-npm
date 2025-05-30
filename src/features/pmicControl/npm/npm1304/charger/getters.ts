/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ChargerGet as ChargerGetNpm1300 } from '../../npm1300/charger/getters';

export class ChargerGet extends ChargerGetNpm1300 {
    batLim = undefined;
}
