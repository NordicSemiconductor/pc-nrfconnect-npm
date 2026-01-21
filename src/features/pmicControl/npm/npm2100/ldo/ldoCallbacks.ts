/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
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
    parseToNumber,
    selectFromTypeValues,
    toRegex,
    toValueRegexString,
} from '../../pmicHelpers';
import { type Ldo, type LdoMode, LdoModeValues } from '../../types';
import {
    type nPM2100GPIOControlMode,
    nPM2100GPIOControlModeValues,
    type nPM2100GPIOControlPinSelect,
    nPM2100GPIOControlPinSelectValues,
    type nPM2100LdoModeControl,
    nPM2100LdoModeControlValues,
    type nPM2100LDOSoftStart,
    nPM2100LDOSoftStartValues,
    type nPM2100SoftStart,
    nPM2100SoftStartValues,
} from '../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
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
                        0,
                    );
                },
                noop,
            ),
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
                        0,
                    );
                },
                noop,
            ),
        );

        // Mode
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw mode',
                    true,
                    undefined,
                    toValueRegexString(LdoModeValues),
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            mode: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                LdoModeValues,
                            ) as LdoMode,
                        },
                        0,
                    );
                },
                noop,
            ),
        );

        // Modectrl
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw modectrl',
                    true,
                    undefined,
                    toValueRegexString(nPM2100LdoModeControlValues),
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            modeControl: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                nPM2100LdoModeControlValues,
                            ) as nPM2100LdoModeControl,
                        },
                        0,
                    );
                },
                noop,
            ),
        );

        // Pinsel
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw pinsel',
                    true,
                    undefined,
                    toValueRegexString(nPM2100GPIOControlPinSelectValues),
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            pinSel: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                nPM2100GPIOControlPinSelectValues,
                            ) as nPM2100GPIOControlPinSelect,
                        },
                        0,
                    );
                },
                noop,
            ),
        );

        // Softstart LDO
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw softstart LDO',
                    true,
                    undefined,
                    toValueRegexString(nPM2100LDOSoftStartValues),
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            ldoSoftStart: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                nPM2100LDOSoftStartValues,
                            ) as nPM2100LDOSoftStart,
                        },
                        0,
                    );
                },
                noop,
            ),
        );

        // Softstart loadsw
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw softstart LOADSW',
                    true,
                    undefined,
                    toValueRegexString(nPM2100SoftStartValues),
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            softStart: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                nPM2100SoftStartValues,
                            ) as nPM2100SoftStart,
                        },
                        0,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 ldosw pinmode',
                    true,
                    undefined,
                    toValueRegexString(nPM2100GPIOControlModeValues),
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            pinMode: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                nPM2100GPIOControlModeValues,
                            ) as nPM2100GPIOControlMode,
                        },
                        0,
                    );
                },
                noop,
            ),
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
                        0,
                    );
                },
                noop,
            ),
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
                        0,
                    );
                },
                noop,
            ),
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
                        0,
                    );
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
