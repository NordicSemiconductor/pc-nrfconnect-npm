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
        this.tChgReduce();
        this.tChgResume();
        this.tChgStatus();
        this.tCold();
        this.tCool();
        this.tWarm();
        this.tHot();
        this.vWeak();
        this.iChgCool();
        this.iChgWarm();
        this.vTermCool();
        this.vTermWarm();
        this.enabledBatteryDischargeCurrentLimit();
        this.enabledChargeCurrentThrottling();
        this.iThrottle();
        this.tOutCharge();
        this.tOutTrickle();
        this.vThrottle();
        this.vBatLow();
    }

    state() {
        this.sendCommand('npm1012 charger state get');
    }

    vTerm() {
        this.sendCommand('npm1012 charger voltage termination get');
    }
    iChg() {
        this.sendCommand('npm1012 charger current charge get');
    }
    enabled() {
        this.sendCommand('npm1012 charger enable get');
    }
    vTrickleFast() {
        this.sendCommand('npm1012 charger voltage trickle get');
    }
    iTerm() {
        this.sendCommand('npm1012 charger current termination get');
    }
    iTrickle() {
        this.sendCommand('npm1012 charger current trickle get');
    }
    enabledRecharging() {
        this.sendCommand('npm1012 charger recharge get');
    }
    enabledWeakBatteryCharging() {
        this.sendCommand('npm1012 charger weakbat_charging get');
    }
    enabledVBatLow() {
        this.sendCommand('npm1012 charger lowbat_charging get');
    }
    tChgReduce() {
        this.sendCommand('npm1012 charger dietemp reduce get');
    }
    tChgResume() {
        this.sendCommand('npm1012 charger dietemp resume get');
    }
    tChgStatus() {
        this.sendCommand('npm1012 charger dietemp status get'); // TODO: Add callback
    }
    tCold() {
        this.sendCommand('npm1012 charger ntc cold get');
    }
    tCool() {
        this.sendCommand('npm1012 charger ntc cool get');
    }
    tWarm() {
        this.sendCommand('npm1012 charger ntc warm get');
    }
    tHot() {
        this.sendCommand('npm1012 charger ntc hot get');
    }
    vWeak() {
        this.sendCommand('npm1012 charger voltage weak get');
    }
    iChgCool() {
        this.sendCommand('npm1012 charger current charge_cool get');
    }
    iChgWarm() {
        this.sendCommand('npm1012 charger current charge_warm get');
    }
    vTermCool() {
        this.sendCommand('npm1012 charger voltage termination_cool get');
    }
    vTermWarm() {
        this.sendCommand('npm1012 charger voltage termination_warm get');
    }
    enabledAdvancedChargingProfile() {
        this.sendCommand('npm1012 charger jeita_charging get');
    }
    enabledNtcMonitoring() {
        this.sendCommand('npm1012 charger ntc monitoring get');
    }
    enabledBatteryDischargeCurrentLimit() {
        this.sendCommand('npm1012 charger discharge_limit get');
    }
    enabledChargeCurrentThrottling() {
        this.sendCommand('npm1012 charger throttling get');
    }
    iThrottle() {
        this.sendCommand('npm1012 charger current throttle get');
    }
    tOutCharge() {
        this.sendCommand('npm1012 charger timeout charging get');
    }
    tOutTrickle() {
        this.sendCommand('npm1012 charger timeout trickle get');
    }
    vThrottle() {
        this.sendCommand('npm1012 charger voltage throttle get');
    }
    vBatLow() {
        this.sendCommand('npm1012 charger voltage batlow get');
    }
}
