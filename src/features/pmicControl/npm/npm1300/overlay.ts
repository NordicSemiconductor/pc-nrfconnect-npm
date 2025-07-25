/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type Npm1304 from '../npm1304/pmic1304Device';
import {
    BuckExport,
    BuckModule,
    Charger,
    GPIOValues,
    LdoExport,
    LdoModule,
    LED,
    LEDMode,
    LowPowerConfig,
    npm1300ResetConfig,
    NpmExportLatest,
    NTCThermistor,
} from '../types';
import type Npm1300 from './pmic1300Device';

const toMicro = (value: number) => value * 1000000;
// const toMilli = (value: number) => value * 1000;

const thermistorTypeToOverlay = (value: NTCThermistor) => {
    switch (value) {
        case '10 kΩ':
            return 10000;
            break;
        case '100 kΩ':
            return 100000;
            break;
        case '47 kΩ':
            return 47000;
            break;
        case 'Ignore NTC':
            return 10000; // TODO: get confirmation from Andy Sinclair
    }
};

const ledModeToOverlay = (mode: LEDMode) => {
    switch (mode) {
        case 'Charger error':
            return 'error';
        case 'Charging':
            return 'charging';
        case 'Host':
            return 'host';
    }
};

const generateCharger = (deviceType: string, charger?: Charger) =>
    charger
        ? `
${deviceType}_ek_charger: charger {
    compatible = "nordic,${deviceType}-charger";
    term-microvolt = <${toMicro(charger.vTerm)}>;
    term-warm-microvolt = <${toMicro(charger.vTermR)}>;
    // term-current-percent = <${charger.iTerm}>;
    current-microamp = <${toMicro(charger.iChg / 1000)}>;
    // trickle-microvolt = <${toMicro(charger.vTrickleFast)}>;
    ${
        charger.iBatLim
            ? `dischg-limit-microamp = <${toMicro(charger.iBatLim / 1000)}>;`
            : ''
    }
    vbus-limit-microamp = <500000>;
    thermistor-ohms = <${thermistorTypeToOverlay(charger.ntcThermistor)}>;
    thermistor-beta = <${charger.ntcBeta}>;
    ${charger.enableRecharging ? '' : '// disable-recharge;'}
    ${charger.enabled ? 'charging-enable;' : ''}
    ${charger.enableVBatLow ? 'vbatlow-charge-enable;' : ''}
};`
        : '';

const generateBuck = (
    buck: BuckExport,
    buckModule: BuckModule,
    deviceType: string
) => `
${deviceType}_ek_buck${buckModule.index + 1}: BUCK${buckModule.index + 1} {
    regulator-min-microvolt = <${toMicro(buckModule.ranges.voltage.min)}>;
    regulator-max-microvolt = <${toMicro(buckModule.ranges.voltage.max)}>;
    ${
        buck.mode !== 'vSet'
            ? `regulator-init-microvolt =  <${toMicro(buck.vOutNormal)}>;`
            : ''
    }
    retention-microvolt = <${toMicro(buck.vOutRetention)}>;
    ${
        buck.onOffControl !== 'Off'
            ? `enable-gpios = <&${deviceType}_ek_gpio ${GPIOValues.findIndex(
                  v => v === buck.onOffControl
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${
        buck.retentionControl !== 'Off'
            ? `retention-gpios = <&${deviceType}_ek_gpio ${GPIOValues.findIndex(
                  v => v === buck.retentionControl
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${
        buck.modeControl.startsWith('GPIO')
            ? `pwm-gpios= <&${deviceType}_ek_gpio ${GPIOValues.findIndex(
                  v => v === buck.modeControl
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${
        buck.modeControl === 'PWM'
            ? 'regulator-initial-mode = <NPM13XX_BUCK_MODE_PWM>;'
            : ''
    }
    ${
        buck.modeControl === 'PFM'
            ? '// regulator-initial-mode = <NPM13XX_BUCK_MODE_PFM>;'
            : ''
    }
};
`;

// TODO: Reinstate // soft-start-microamp = <${toMilli(ldo.softStart)}>;
const generateLDO = (
    ldo: LdoExport,
    ldoModule: LdoModule,
    deviceType: string
) => `
${deviceType}_ek_ldo${ldoModule.index + 1}: LDO${ldoModule.index + 1} {
    regulator-min-microvolt = <${toMicro(ldoModule.ranges.voltage.min)}>;
    regulator-max-microvolt = <${toMicro(ldoModule.ranges.voltage.max)}>;
    ${
        ldo.mode === 'LDO'
            ? `regulator-init-microvolt = <${toMicro(ldo.voltage)}>;`
            : ''
    }
    regulator-initial-mode = <${
        ldo.mode === 'LDO' ? 'NPM13XX_LDSW_MODE_LDO' : 'NPM13XX_LDSW_MODE_LDSW'
    }>;
    ${
        ldo.onOffControl !== 'SW'
            ? `enable-gpios = <&${deviceType}_ek_gpio ${GPIOValues.findIndex(
                  v => v === ldo.onOffControl
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${ldo.enabled ? 'regulator-boot-on;' : ''}
};
`;

const generateLEDs = (leds: LED[], deviceType: string) => `
${deviceType}_ek_leds: leds {
    compatible = "nordic,${deviceType}-led";
    ${leds
        .map(
            (led, index) =>
                `nordic,led${index}-mode = "${ledModeToOverlay(led.mode)}";`
        )
        .join('    \n')}
};
`;

const generateLowPower = (lowPower?: LowPowerConfig) =>
    lowPower
        ? `
    // ship-to-active-time = <${lowPower.timeToActive}>;
`
        : '';

const generateReset = (reset?: npm1300ResetConfig) =>
    reset
        ? `
    // long-press-reset = "${reset.longPressReset}";
`
        : '';

export default (npmConfig: NpmExportLatest, npmDevice: Npm1300 | Npm1304) => `/*
* Copyright (C) 2023 Nordic Semiconductor ASA
* SPDX-License-Identifier: Apache-2.0
*/

#include <dt-bindings/regulator/npm13xx.h>
#include <zephyr/dt-bindings/input/input-event-codes.h>

&arduino_i2c {
   ${npmDevice.deviceType}_ek_pmic: pmic@6b {
       compatible = "nordic,${npmDevice.deviceType}";
       reg = <0x6b>;

       ${generateLowPower(npmConfig.lowPower)}
       ${generateReset(npmConfig.reset as npm1300ResetConfig)}

       ${npmDevice.deviceType}_ek_gpio: gpio-controller {
           compatible = "nordic,${npmDevice.deviceType}-gpio";
           gpio-controller;
           #gpio-cells = <2>;
           ngpios = <5>;
       };

       ${npmDevice.deviceType}_ek_regulators: regulators {
           compatible = "nordic,${npmDevice.deviceType}-regulator";

           ${
               // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
               npmConfig
                   .bucks!.map((buck, index) =>
                       generateBuck(
                           buck,
                           npmDevice.buckModule[index],
                           npmDevice.deviceType
                       )
                   )
                   .join('\n\n')
           }

            ${npmConfig.ldos
                .map((ldos, index) =>
                    generateLDO(
                        ldos,
                        npmDevice.ldoModule[index],
                        npmDevice.deviceType
                    )
                )
                .join('\n\n')}
       };

       ${generateCharger(npmDevice.deviceType, npmConfig.charger)}

       ${generateLEDs(npmConfig.leds, npmDevice.deviceType)}
   };
};`;
