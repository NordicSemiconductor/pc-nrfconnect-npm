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
    parseToFloat,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { Buck } from '../../types';
import {
    BuckAlternateVOutControl1012,
    BuckModeControlValues1012,
    BuckOnOffControl1012,
    BuckVOutRippleControlValues1012,
} from './types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    index: number,
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck vout software', true, 0),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            vOutNormal: parseToFloat(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck pulldown', true, undefined, '(\\w+)'),
                res => {
                    const result = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            activeDischargeResistance: !Number.isNaN(result)
                                ? result
                                : 0,
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck vout software', true, 1),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            alternateVOut: parseToFloat(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck voutsel', true, undefined, '(\\w+)'),
                res => {
                    let alternateVOutControl: BuckAlternateVOutControl1012 =
                        'Off';

                    switch (parseColonBasedAnswer(res)) {
                        case 'VOUT1':
                            alternateVOutControl = 'Off';
                            break;
                        case 'VOUT2':
                            alternateVOutControl = 'Software';
                            break;
                        default:
                            return;
                    }

                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            alternateVOutControl,
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck voutselctrl', true, undefined, '(\\w+)'),
                res => {
                    let update: Partial<Buck> = {};
                    switch (parseColonBasedAnswer(res)) {
                        case 'GPIO':
                            update = { alternateVOutControl: 'GPIO' };
                            break;
                        case 'SOFTWARE':
                            update = { mode: 'software' };
                            break;
                        case 'VSET':
                            update = { mode: 'vSet' };
                            break;
                        default:
                            return;
                    }

                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        update,
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm1012 buck passthrough',
                    true,
                    undefined,
                    onOffRegex,
                ),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            automaticPassthrough: parseOnOff(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck pwrmode', true, undefined, '(\\w+)'),
                res => {
                    const result = parseColonBasedAnswer(res).toUpperCase();

                    const modeControl = BuckModeControlValues1012.find(
                        elem => elem === result,
                    );

                    if (modeControl === undefined) {
                        return;
                    }

                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            modeControl,
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck enable', true, undefined, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            enabled: parseOnOff(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck enablectrl', true, undefined, '(\\w+)'),
                res => {
                    const result = parseColonBasedAnswer(res).toLowerCase();

                    let onOffControl: BuckOnOffControl1012 = 'Software';
                    switch (result) {
                        case 'gpio':
                            onOffControl = 'GPIO';
                            break;
                        case 'software':
                            onOffControl = 'Software';
                            break;
                        case 'vset':
                            onOffControl = 'VSET';
                            break;
                        default:
                            return;
                    }

                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            onOffControl,
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck peakilim', true),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            peakCurrentLimit: parseToNumber(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck autopull', true, undefined, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            quickVOutDischarge: parseOnOff(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck scprotect', true, undefined, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            shortCircuitProtection: parseOnOff(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck softstartilim', true),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            softStartPeakCurrentLimit: parseToNumber(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck bias lp', true),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            vOutComparatorBiasCurrentLPMode: parseToFloat(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck bias ulp', true),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            vOutComparatorBiasCurrentULPMode: parseToFloat(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 buck ripple', true, undefined, '(\\w+)'),
                res => {
                    const result = parseColonBasedAnswer(res).toLowerCase();

                    const vOutRippleControl =
                        BuckVOutRippleControlValues1012.find(
                            elem => elem.toLowerCase() === result,
                        );

                    if (vOutRippleControl === undefined) {
                        return;
                    }

                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            vOutRippleControl,
                        },
                        index,
                    );
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
