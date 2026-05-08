/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    type NpmEventEmitter,
    onOffRegex,
    parseColonBasedAnswer,
    parseOnOff,
} from '../../pmicHelpers';
import { type LowPowerConfig, type TimeToActive } from '../../types';
import { timeToActiveKeys } from './types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    if (shellParser === undefined) {
        return [];
    }

    const callbacks = [];

    callbacks.push(
        shellParser.registerCommandCallback(
            `npm1012 low_power_ctrl shphld hibernate_wakeup (get|set ${onOffRegex})`,
            res => {
                eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        hibernateWakeupByButton: parseOnOff(res),
                    },
                );
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            `npm1012 low_power_ctrl shphld debounce (get|set (OFF|${timeToActiveKeys.join('|')}))`,
            res => {
                eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        timeToActive: parseColonBasedAnswer(
                            res,
                        ) as TimeToActive,
                    },
                );
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            'npm1012 low_power_ctrl (ship_mode set on|vbat state set hibernate)',
            () => {
                eventEmitter.emit('onReboot', true);
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            `npm1012 low_power_ctrl vbus hibernate_wait (get|set ${onOffRegex})`,
            res => {
                eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        vbusHibernateWait: parseOnOff(res),
                    },
                );
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            `npm1012 low_power_ctrl vbus standby_wait (get|set ${onOffRegex})`,
            res => {
                eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        vbusStandbyWait: parseOnOff(res),
                    },
                );
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            'npm1012 low_power_ctrl vbus status get',
            res => {
                const update: Partial<LowPowerConfig> = {};

                const commaSeparated = parseColonBasedAnswer(res)
                    .toLowerCase()
                    .split(',');
                commaSeparated.forEach(value => {
                    switch (value) {
                        case 'hibernate_waiting':
                            update.vbusHibernateWaitingForChargeComplete = true;
                            break;
                        case 'no_request':
                            update.vbusHibernateWaitingForChargeComplete = false;
                            update.vbusStandbyWaitingForChargeComplete = false;
                            break;
                        case 'standby_waiting':
                            update.vbusStandbyWaitingForChargeComplete = true;
                            break;
                    }
                });

                eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    update,
                );
            },
            noop,
        ),
    );

    return callbacks;
};
