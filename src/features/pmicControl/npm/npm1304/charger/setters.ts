/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ChargerSet as ChargerSetNpm1300 } from '../../npm1300/charger/setters';

export class ChargerSet extends ChargerSetNpm1300 {
    batLim = undefined;
}
