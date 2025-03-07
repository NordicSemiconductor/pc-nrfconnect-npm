/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class ChargerGet {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void
    ) {}

    all() {
        this.state();
        this.vTerm();
        this.iChg();
        this.enabled();
        this.vTrickleFast();
        this.iTerm();
        this.batLim();
        this.enabledRecharging();
        this.enabledVBatLow();
        this.nTCThermistor();
        this.nTCBeta();
        this.tChgStop();
        this.tChgResume();
        this.vTermR();
        this.tCold();
        this.tCool();
        this.tWarm();
        this.tHot();
    }

    state() {
        this.sendCommand('npmx charger status all get');
    }

    vTerm() {
        this.sendCommand('npmx charger termination_voltage normal get');
    }
    iChg() {
        this.sendCommand('npmx charger charging_current get');
    }
    enabled() {
        this.sendCommand('npmx charger module charger get');
    }
    vTrickleFast() {
        this.sendCommand('npmx charger trickle_voltage get');
    }
    iTerm() {
        this.sendCommand('npmx charger termination_current get');
    }
    batLim() {
        this.sendCommand('npm_adc fullscale get');
    }
    enabledRecharging() {
        this.sendCommand('npmx charger module recharge get');
    }
    enabledVBatLow() {
        this.sendCommand('powerup_charger vbatlow get');
    }
    nTCThermistor() {
        this.sendCommand('npmx adc ntc type get');
    }
    nTCBeta() {
        this.sendCommand('npmx adc ntc beta get');
    }
    tChgStop() {
        this.sendCommand('npmx charger die_temp stop get');
    }
    tChgResume() {
        this.sendCommand('npmx charger die_temp resume get');
    }
    vTermR() {
        this.sendCommand('npmx charger termination_voltage warm get');
    }
    tCold() {
        this.sendCommand('npmx charger ntc_temperature cold get');
    }
    tCool() {
        this.sendCommand('npmx charger ntc_temperature cool get');
    }
    tWarm() {
        this.sendCommand('npmx charger ntc_temperature warm get');
    }
    tHot() {
        this.sendCommand('npmx charger ntc_temperature hot get');
    }
}
