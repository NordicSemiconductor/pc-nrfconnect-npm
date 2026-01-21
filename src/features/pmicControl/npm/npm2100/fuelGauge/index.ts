/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */

import {
    type FuelGauge,
    type FuelGaugeModule as FuelGaugeModuleBase,
    type ModuleParams,
} from '../../types';
import { FuelGaugeActions } from './fuelGaugeActions';
import fuelGaugeCallbacks from './fuelGaugeCallbacks';
import { FuelGaugeGet } from './fuelGaugeGet';
import { FuelGaugeSet } from './fuelGaugeSet';

export default class Module implements FuelGaugeModuleBase {
    profileDownloadInProgress = false;
    profileDownloadAborting = false;
    private _get: FuelGaugeGet;
    private _set: FuelGaugeSet;
    private _actions: FuelGaugeActions;
    private _callbacks: ReturnType<typeof fuelGaugeCallbacks>;

    constructor({
        sendCommand,
        eventEmitter,
        shellParser,
        offlineMode,
        dialogHandler,
        npmDevice,
    }: ModuleParams) {
        this._get = new FuelGaugeGet(sendCommand);
        this._set = new FuelGaugeSet(
            eventEmitter,
            sendCommand,
            offlineMode,
            npmDevice.initializeFuelGauge.bind(npmDevice),
            dialogHandler,
        );
        this._actions = new FuelGaugeActions(eventEmitter, sendCommand, this);
        this._callbacks = fuelGaugeCallbacks(
            shellParser,
            eventEmitter,
            this._get,
            this,
        );
    }

    get get() {
        return this._get;
    }

    get set() {
        return this._set;
    }

    get actions() {
        return this._actions;
    }

    get callbacks() {
        return this._callbacks;
    }

    // eslint-disable-next-line class-methods-use-this
    get defaults(): FuelGauge {
        return {
            enabled: false,
            chargingSamplingRate: 500,
            notChargingSamplingRate: 1000,
            reportingRate: 2000,
        };
    }
}
