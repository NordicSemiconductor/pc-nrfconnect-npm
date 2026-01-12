/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType } from '../../../../../utils/helpers';
import nPM1300LdoModule from '../../npm1300/ldo';
import { Ldo } from '../../types';

const getLdoVoltageRange = () =>
    ({
        min: 1,
        max: 3.3,
        decimals: 1,
        step: 0.1,
    }) as RangeType;

const ldoDefaults = (hardwareRevision: string | undefined): Ldo => ({
    voltage: getLdoVoltageRange().min,
    mode: 'Load_switch',
    enabled: false,
    softStartEnabled: true,
    softStart: 25,
    activeDischarge: false,
    onOffControl: 'SW',
    onOffSoftwareControlEnabled: true,
    ldoSoftStartEnable: hardwareRevision === 'FOO', // npm 1304
});

export default class Module extends nPM1300LdoModule {
    get defaults(): Ldo {
        return ldoDefaults(this.hardwareRevision);
    }
}
