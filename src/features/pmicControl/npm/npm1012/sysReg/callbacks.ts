/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    type NpmEventEmitter,
    parseColonBasedAnswer,
    parseLogData,
    toRegex,
    toValueRegex,
} from '../../pmicHelpers';
import { type SysReg, type VBusDpm, type VBusILim } from '../../types';
import { vBusDpmKeys, vBusILimKeys } from './types';

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
            toRegex(
                'npm1012 sysreg vbusdpm',
                true,
                undefined,
                toValueRegex(vBusDpmKeys),
            ),
            res => {
                eventEmitter.emitPartialEvent<SysReg>('onSysRegUpdate', {
                    vBusDpm: parseColonBasedAnswer(res) as VBusDpm,
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 sysreg vbusilim',
                true,
                undefined,
                toValueRegex(vBusILimKeys),
            ),
            res => {
                eventEmitter.emitPartialEvent<SysReg>('onSysRegUpdate', {
                    vBusILim: parseColonBasedAnswer(res) as VBusILim,
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 sysreg vbus_status get',
                false,
                undefined,
                '(\\w+)',
            ),
            res => {
                const sysReg: Partial<SysReg> = {
                    vBusGood: false,
                    vBusPresent: false,
                };

                const messageParts = parseColonBasedAnswer(res).split(',');
                messageParts.forEach(part => {
                    switch (part) {
                        case 'Good':
                            sysReg.vBusGood = true;
                            break;
                        case 'Overvoltage':
                            break;
                        case 'Present':
                            sysReg.vBusPresent = true;
                            break;
                        case 'Undervoltage':
                            break;
                    }
                });

                eventEmitter.emitPartialEvent<SysReg>('onSysRegUpdate', sysReg);
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.onShellLoggingEvent(logEvent => {
            parseLogData(logEvent, loggingEvent => {
                if (loggingEvent.module !== 'module_pmic_irq') {
                    return;
                }

                const sysReg: Partial<SysReg> = {};

                switch (loggingEvent.message) {
                    case 'EVENT_VBUSOKNE':
                        sysReg.vBusGood = false;
                        break;
                    case 'EVENT_VBUSOKPE':
                        sysReg.vBusGood = true;
                        break;
                    case 'EVENT_VBUSOVNE':
                        break;
                    case 'EVENT_VBUSOVPE':
                        break;
                    case 'EVENT_VBUSPRESENTNE':
                        sysReg.vBusPresent = false;
                        break;
                    case 'EVENT_VBUSPRESENTPE':
                        sysReg.vBusPresent = true;
                        break;
                    case 'EVENT_VBUSUNDERNE':
                        break;
                    case 'EVENT_VBUSUNDERPE':
                        break;
                }

                eventEmitter.emitPartialEvent<SysReg>('onSysRegUpdate', sysReg);
            });
        }),
    );

    return callbacks;
};
