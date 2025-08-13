/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    BoostExport,
    BoostModeControl,
    BoostModule,
    BoostPinMode,
    BoostPinSelection,
    GPIOExport,
    LdoExport,
    LdoModule,
    npm2100LowPowerConfig,
    npm2100ResetConfig,
    NpmExportLatest,
} from '../types';
import { GPIOMode2100 } from './gpio/types';
import type Npm2100 from './pmic2100Device';
import { nPM2100GPIOControlMode, nPM2100LdoModeControl } from './types';

const toMicro = (value: number) => value * 1000000;
// const toMilli = (value: number) => value * 1000;

const boostModeControlToMacro = (modeControl: BoostModeControl) => {
    switch (modeControl) {
        case 'AUTO':
            return 'NPM2100_REG_OPER_AUTO';
        case 'NOHP':
            return 'NPM2100_REG_OPER_NOHP';
        case 'LP':
            return 'NPM2100_REG_OPER_LP';
        case 'HP':
            return 'NPM2100_REG_OPER_HP';
        case 'PASS':
            return 'NPM2100_REG_OPER_PASS';
    }
};

const boostGPIOControlToMacro = (pinMode: BoostPinMode) => {
    switch (pinMode) {
        case 'NOHP':
            return 'NPM2100_REG_FORCE_NOHP';
        case 'HP':
            return 'NPM2100_REG_FORCE_HP';
        case 'LP':
            return 'NPM2100_REG_FORCE_LP';
        case 'PASS':
            return 'NPM2100_REG_FORCE_PASS';
    }
};

const generateBoostRegulatorInitialModeProperty = (boost: BoostExport) => {
    const macros: string[] = [];

    if (boost.pinSelection !== 'OFF' || boost.modeControl !== 'AUTO') {
        macros.push(boostModeControlToMacro(boost.modeControl));
    }

    if (boost.pinSelection !== 'OFF') {
        macros.push(boostGPIOControlToMacro(boost.pinMode));
    }

    if (macros.length === 0) {
        return '';
    }

    return `regulator-initial-mode = <(${macros.join(' | ')})>;`;
};

const generateModeGpiosProperty = (
    pinSelection: BoostPinSelection,
    gpios: GPIOExport[]
) => {
    if (pinSelection === 'OFF') {
        return '';
    }

    const number = parseInt(pinSelection.charAt(4), 10);
    const isHigh = pinSelection.endsWith('HI');
    let pull = '';
    if (gpios[number].pull !== 'NOPULL') {
        pull =
            gpios[number].pull === 'PULLUP' ? 'GPIO_PULL_UP' : 'GPIO_PULL_DOWN';
    }

    return `mode-gpios = <&npm2100_gpio ${number} (${
        isHigh ? 'GPIO_ACTIVE_HIGH' : 'GPIO_ACTIVE_LOW'
    } ${pull ? ` | ${pull}` : ''} | ${
        gpios[number].debounce
            ? 'NPM2100_GPIO_DEBOUNCE_ON'
            : 'NPM2100_GPIO_DEBOUNCE_OFF'
    })>;`;
};

const generateBoost = (
    boost: BoostExport,
    boostModule: BoostModule,
    gpios: GPIOExport[]
) => `npm2100ek_boost: BOOST {
                regulator-always-on;
                regulator-min-microvolt = <${toMicro(
                    boostModule.ranges.voltage.min
                )}>;
                regulator-max-microvolt = <${toMicro(
                    boostModule.ranges.voltage.max
                )}>;

                ${
                    boost.vOutSelect === 'Software'
                        ? `regulator-init-microvolt = <${toMicro(
                              boost.vOutSoftware
                          )}>;`
                        : ''
                }
                ${
                    boost.overCurrentProtection
                        ? 'regulator-init-microamp = <300000>;'
                        : 'regulator-init-microamp = <0>;'
                }
                ${generateBoostRegulatorInitialModeProperty(boost)}
                ${generateModeGpiosProperty(boost.pinSelection, gpios)}
            };
`;

const ldoModeContolToMacro = (modeControl: nPM2100LdoModeControl) => {
    switch (modeControl) {
        case 'auto':
            return 'NPM2100_REG_OPER_AUTO';
        case 'hp':
            return 'NPM2100_REG_OPER_HP';
        case 'ulp':
            return 'NPM2100_REG_OPER_ULP';
    }

    throw new Error(`Unknown LDO mode control: ${modeControl}`);
};

const ldoPinModeToMacro = (pinMode: nPM2100GPIOControlMode) => {
    switch (pinMode) {
        case 'HP/OFF':
            return 'NPM2100_REG_OPER_OFF | NPM2100_REG_FORCE_HP';
        case 'ULP/OFF':
            return 'NPM2100_REG_OPER_OFF | NPM2100_REG_FORCE_ULP';
        case 'HP/ULP':
            return 'NPM2100_REG_OPER_ULP | NPM2100_REG_FORCE_HP';
    }
};

const generateLDORegulatorInitialModeProperty = (ldo: LdoExport) => {
    if (ldo.mode === 'LDO' && ldo.modeControl === 'auto') {
        return '';
    }

    if (!ldo.pinMode || !ldo.modeControl) {
        return '';
    }

    const macros: string[] = [];

    if (ldo.modeControl === 'gpio') {
        macros.push(ldoPinModeToMacro(ldo.pinMode));
    } else {
        macros.push(ldoModeContolToMacro(ldo.modeControl));
    }

    if (ldo.mode === 'Load_switch') {
        macros.push('NPM2100_REG_LDSW_EN');
    }

    return `regulator-initial-mode = <${macros.join(' | ')}>;`;
};

const generateLDOSW = (
    ldo: LdoExport,
    ldoModule: LdoModule,
    gpios: GPIOExport[]
) =>
    `npm2100ek_ldosw: LDOSW {
                regulator-min-microvolt = <${toMicro(
                    ldoModule.ranges.voltage.min
                )}>;
                regulator-max-microvolt = <${toMicro(
                    ldoModule.ranges.voltage.max
                )}>;
 
                ${ldo.enabled ? 'regulator-boot-on;' : ''}
                ${
                    ldo.mode === 'LDO'
                        ? `regulator-init-microvolt = <${toMicro(
                              ldo.voltage
                          )}>;`
                        : ''
                }
                ${
                    ldo.ocpEnabled
                        ? `regulator-init-microamp = <${toMicro(
                              parseInt(
                                  (ldo.ldoSoftStart && ldo.mode === 'LDO'
                                      ? ldo.ldoSoftStart
                                      : ldo.softStart
                                  ).toString(),
                                  10
                              )
                          )}>;`
                        : ''
                }
                ${generateLDORegulatorInitialModeProperty(ldo)}
                ${
                    ldo.pinSel
                        ? generateModeGpiosProperty(ldo.pinSel, gpios)
                        : ''
                }
            };
`;

const generateShipHoldLongPressProperty = (
    reset: npm2100ResetConfig,
    lowPower: npm2100LowPowerConfig
) => {
    if (reset.longPressResetEnable && reset.resetPinSelection === 'SHPHLD') {
        return 'shiphold-longpress = "reset";';
    }

    if (lowPower.powerButtonEnable) {
        return 'shiphold-longpress = "ship";';
    }

    return 'shiphold-longpress = "disable"';
};

export default (npmConfig: NpmExportLatest, npmDevice: Npm2100) => {
    const numberOfGPIOInterrupts = npmConfig.gpios.reduce((pv, cv) => {
        if (
            (cv.mode as GPIOMode2100) ===
                GPIOMode2100['Interrupt output, active high'] ||
            (cv.mode as GPIOMode2100) ===
                GPIOMode2100['Interrupt output, active low']
        ) {
            return pv + 1;
        }
        return pv;
    }, 0);
    if (numberOfGPIOInterrupts > 1) {
        logger.warn(`TODO: Even though it's possible to set both of them as such, we should probably disallow it or
         * warn when such config is exported, since it makes no sense in real application.`);
    }

    return `/*
* Copyright (C) 2025 Nordic Semiconductor ASA
* SPDX-License-Identifier: Apache-2.0
*/

#include <dt-bindings/regulator/npm2100.h>
#include <zephyr/dt-bindings/input/input-event-codes.h>
#include <zephyr/dt-bindings/gpio/nordic-npm2100-gpio.h>

&arduino_i2c {
    npm2100ek_pmic: pmic@74 {
        compatible = "nordic,npm2100";
        reg = <0x74>;

        ${
            numberOfGPIOInterrupts
                ? `
        host-int-type = "level";
        // pmic-int-pin = <pin number>; // TODO what should pin and number be?
        pmic-int-flags = <pull | active_level | open drain>;
            `
                : ''
        }

        ${generateShipHoldLongPressProperty(
            npmConfig.reset as npm2100ResetConfig,
            npmConfig.lowPower as npm2100LowPowerConfig
        )}
        

        npm2100ek_gpio: gpio-controller {
            compatible = "nordic,npm2100-gpio";
            gpio-controller;
            #gpio-cells = <2>;
            ngpios = <2>;
        };

        npm2100ek_regulators: regulators {
            compatible = "nordic,npm2100-regulator";

            ${npmConfig.boosts
                .map((boost, index) =>
                    generateBoost(
                        boost,
                        npmDevice.boostModule[index],
                        npmConfig.gpios
                    )
                )
                .join('\n\n')}

            ${npmConfig.ldos
                .map((ldos, index) =>
                    generateLDOSW(
                        ldos,
                        npmDevice.ldoModule[index],
                        npmConfig.gpios
                    )
                )
                .join('\n\n')}
        };

        npm2100_wdt: watchdog {
            compatible = "nordic,npm2100-wdt";
        };

        npm2100_vbat: vbat {
            compatible = "nordic,npm2100-vbat";
        };
   };
};`;
};
