/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

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
        this.tChgStop();
        this.tChgResume();
        this.vTermR();
        this.tCold();
        this.tCool();
        this.tWarm();
        this.tHot();
        this.vWeak();
        this.iChgCool();
        this.iChgWarm();
        this.vTermCool();
        this.vTermWarm();
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
    iChgCool() {
        this.sendCommand('npmx charger charging_current cool get');
    }
    iChgWarm() {
        this.sendCommand('npmx charger charging_current warm get');
    }
    vTermCool() {
        this.sendCommand('npmx charger termination_voltage cool get');
    }
    vTermWarm() {
        this.sendCommand('npmx charger termination_voltage warm get');
    }
    enabledAdvancedChargingProfile() {
        this.sendCommand('npmx charger advanced_charging_profile enable get');
    }
    enabledNtcMonitoring() {
        this.sendCommand('npmx charger ntc_monitoring enable get');
    }

    // eslint-disable-next-line class-methods-use-this
    iChgAndITermValid(iChg: number, iTerm: number): boolean {
        if (iChg < 8 && iTerm <= 1.56) {
            logger.error(
                `iChg must be at least 8 mA when iTerm is 1.56% or less`,
            );
            return false;
        }
        return true;
    }
}
