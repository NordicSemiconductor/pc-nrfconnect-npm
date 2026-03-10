/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LdoMode } from '../../types';

export class LdoGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.voltage();
        this.enabled();
        this.mode();
        this.modeCtrl();
        this.pinSel();
        this.softStartCurrent('LDO');
        this.softStartCurrent('Load_switch');
        this.pinMode();
        this.ocp();
        this.ramp();
        this.halt();
    }

    voltage() {
        this.sendCommand(`npm2100 ldosw vout get`);
    }

    enabled() {
        this.sendCommand(`npm2100 ldosw enable get`);
    }

    mode() {
        this.sendCommand(`npm2100 ldosw mode get`);
    }

    modeCtrl() {
        this.sendCommand(`npm2100 ldosw modectrl get`);
    }

    pinSel() {
        this.sendCommand(`npm2100 ldosw pinsel get`);
    }

    softStartCurrent(mode?: LdoMode) {
        if (mode === undefined) {
            return;
        }
        this.sendCommand(
            `npm2100 ldosw softstart ${mode === 'LDO' ? 'LDO' : 'LOADSW'} get`,
        );
    }

    pinMode() {
        this.sendCommand(`npm2100 ldosw pinmode get`);
    }

    ocp() {
        this.sendCommand(`npm2100 ldosw ocp get`);
    }

    ramp() {
        this.sendCommand(`npm2100 ldosw ldoramp get`);
    }

    halt() {
        this.sendCommand(`npm2100 ldosw ldohalt get`);
    }
}
