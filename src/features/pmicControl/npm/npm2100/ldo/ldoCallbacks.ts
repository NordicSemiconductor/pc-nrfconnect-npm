/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    onOffRegex,
    parseColonBasedAnswer,
    parseOnOff,
    parseToNumber,
    toRegex,
    toValueRegex,
} from '../../pmicHelpers';
import { Ldo, LdoMode, LdoModeValues } from '../../types';
import {
    nPM2100GPIOControlMode,
    nPM2100GPIOControlModeValues,
    nPM2100GPIOControlPinSelect,
    nPM2100GPIOControlPinSelectValues,
    nPM2100LdoModeControl,
    nPM2100LdoModeControlValues,
    nPM2100LDOSoftStart,
    nPM2100LDOSoftStartValues,
    nPM2100LoadSwitchSoftStart,
    nPM2100LoadSwitchSoftStartValues,
} from '../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 ldosw vout', true, undefined),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            voltage: parseToNumber(res) / 1000, // mV to V
                        },
                        0
                    );
                },
                noop
            )
        );

        // Enable
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 ldosw enable', true, undefined, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            enabled: parseOnOff(res),
                        },
                        0
                    );
                },
                noop
            )
        );

        // Mode
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw mode',
                    true,
                    undefined,
                    toValueRegex(LdoModeValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            mode: parseColonBasedAnswer(res) as LdoMode,
                        },
                        0
                    );
                },
                noop
            )
        );

        // Modectrl
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw modectrl',
                    true,
                    undefined,
                    toValueRegex(nPM2100LdoModeControlValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            modeControl: parseColonBasedAnswer(
                                res
                            ) as nPM2100LdoModeControl,
                        },
                        0
                    );
                },
                noop
            )
        );

        // Pinsel
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw pinsel',
                    true,
                    undefined,
                    toValueRegex(nPM2100GPIOControlPinSelectValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            pinSel: parseColonBasedAnswer(
                                res
                            ) as nPM2100GPIOControlPinSelect,
                        },
                        0
                    );
                },
                noop
            )
        );

        // Softstart LDO
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw softstart LDO',
                    true,
                    undefined,
                    toValueRegex(nPM2100LDOSoftStartValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            ldoSoftStart: parseColonBasedAnswer(
                                res
                            ) as nPM2100LDOSoftStart,
                        },
                        0
                    );
                },
                noop
            )
        );

        // Softstart loadsw
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw softstart LOADSW',
                    true,
                    undefined,
                    toValueRegex(nPM2100LoadSwitchSoftStartValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            loadSwitchSoftStart: parseColonBasedAnswer(
                                res
                            ) as nPM2100LoadSwitchSoftStart,
                        },
                        0
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw pinmode',
                    true,
                    undefined,
                    toValueRegex(nPM2100GPIOControlModeValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            pinMode: parseColonBasedAnswer(
                                res
                            ) as nPM2100GPIOControlMode,
                        },
                        0
                    );
                },
                noop
            )
        );

        // OCP - Over Current Protection
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 ldosw ocp', true, undefined, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            ocpEnabled: parseOnOff(res),
                        },
                        0
                    );
                },
                noop
            )
        );

        // LDO Ramping
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 ldosw ldoramp', true, undefined, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            rampEnabled: parseOnOff(res),
                        },
                        0
                    );
                },
                noop
            )
        );

        // LDO Halt Ramping
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 ldosw ldohalt', true, undefined, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            haltEnabled: parseOnOff(res),
                        },
                        0
                    );
                },
                noop
            )
        );
    }

    return cleanupCallbacks;
};
