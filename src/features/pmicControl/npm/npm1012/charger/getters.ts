/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ChargerModuleGetBase } from '../../types';

export class ChargerGet extends ChargerModuleGetBase {
    all() {
        this.state();
        this.vTerm();
        this.iChg();
        this.enabled();
        this.iTerm();
        this.iTrickle();
        this.vTrickleFast();
        this.enabledRecharging();
        this.enabledWeakBatteryCharging();
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
        this.vWeak();
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
    iTrickle() {
        this.sendCommand('npmx charger trickle_current get');
    }
    enabledRecharging() {
        this.sendCommand('npmx charger module recharge get');
    }
    enabledWeakBatteryCharging() {
        this.sendCommand('npmx charger module weak_charge get');
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
    vWeak() {
        this.sendCommand('npmx charger weak_voltage get');
    }
}
