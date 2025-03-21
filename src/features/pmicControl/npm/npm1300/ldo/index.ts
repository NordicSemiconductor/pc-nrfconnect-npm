/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RangeType } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { Ldo, LdoExport, LdoModule, PmicDialog } from '../../types';
import ldoCallbacks from './ldoCallbacks';
import { LdoGet } from './ldoGet';
import { LdoSet } from './ldoSet';
import { SoftStart, SoftStartValues } from './types';

const ldoDefaults = (): Ldo => ({
    voltage: getLdoVoltageRange().min,
    mode: 'Load_switch',
    enabled: false,
    softStartEnabled: true,
    softStart: 20,
    activeDischarge: false,
    onOffControl: 'SW',
    onOffSoftwareControlEnabled: true,
});

export const toLdoExport = (ldo: Ldo): LdoExport => ({
    voltage: ldo.voltage,
    enabled: ldo.enabled,
    mode: ldo.mode,
    softStartEnabled: ldo.softStartEnabled,
    softStart: ldo.softStart,
    activeDischarge: ldo.activeDischarge,
    onOffControl: ldo.onOffControl,
});

const getLdoVoltageRange = () =>
    ({
        min: 1,
        max: 3.3,
        decimals: 1,
        step: 0.1,
    } as RangeType);

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

export default class Module implements LdoModule {
    private _get: LdoGet;
    private _set: LdoSet;
    private _callbacks: (() => void)[];
    constructor(
        readonly index: number,
        shellParser: ShellParser | undefined,
        eventEmitter: NpmEventEmitter,
        sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        dialogHandler: ((dialog: PmicDialog) => void) | null,
        offlineMode: boolean
    ) {
        this._get = new LdoGet(sendCommand, index);
        this._set = new LdoSet(
            eventEmitter,
            sendCommand,
            dialogHandler,
            offlineMode,
            index
        );
        this._callbacks = ldoCallbacks(shellParser, eventEmitter, index);
    }

    get get() {
        return this._get;
    }

    get set() {
        return this._set;
    }

    get callbacks() {
        return this._callbacks;
    }

    get values(): {
        softstart: { label: string; value: SoftStart }[];
    } {
        return {
            softstart: [...SoftStartValues].map((item, i) => ({
                label: `${SoftStartValues[i]}`,
                value: item,
            })),
        };
    }

    get ranges(): { voltage: RangeType } {
        return {
            voltage: getLdoVoltageRange(),
        };
    }
    get defaults(): Ldo {
        return ldoDefaults();
    }
}
