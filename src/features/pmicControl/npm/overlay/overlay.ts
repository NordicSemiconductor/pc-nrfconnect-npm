/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BuckExport,
    BuckModule,
    Charger,
    GPIOValues,
    LdoExport,
    LdoModule,
    LED,
    LEDMode,
    NpmDevice,
    NpmExport,
    NTCThermistor,
    ShipModeConfig,
} from '../types';

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

const generateCharger = (charger?: Charger) =>
    charger
        ? `
npm1300_ek_charger: charger {
    compatible = "nordic,npm1300-charger";
    term-microvolt = <${toMicro(charger.vTerm)}>;
    term-warm-microvolt = <${toMicro(charger.vTermR)}>;
    // term-current-percent = <${Number.parseInt(charger.iTerm, 10)}>;
    current-microamp = <${toMicro(charger.iChg / 1000)}>;
    // trickle-microvolt = <${toMicro(charger.vTrickleFast)}>;
    dischg-limit-microamp = <${toMicro(charger.iBatLim / 1000)}>;
    vbus-limit-microamp = <500000>;
    thermistor-ohms = <${thermistorTypeToOverlay(charger.ntcThermistor)}>;
    thermistor-beta = <${charger.ntcBeta}>;
    ${charger.enableRecharging ? '' : '// disable-recharge;'}
    ${charger.enabled ? 'charging-enable;' : ''}
    ${charger.enableVBatLow ? 'vbatlow-charge-enable;' : ''}
};`
        : '';

const generateBuck = (buck: BuckExport, buckModule: BuckModule) => `
npm1300_ek_buck${buckModule.index + 1}: BUCK${buckModule.index + 1} {
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
            ? `enable-gpios = <&npm1300_ek_gpio ${GPIOValues.findIndex(
                  v => v === buck.onOffControl
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${
        buck.retentionControl !== 'Off'
            ? `retention-gpios = <&npm1300_ek_gpio ${GPIOValues.findIndex(
                  v => v === buck.retentionControl
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${
        buck.modeControl.startsWith('GPIO')
            ? `pwm-gpios= <&npm1300_ek_gpio ${GPIOValues.findIndex(
                  v => v === buck.modeControl
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${
        buck.modeControl === 'PWM'
            ? 'regulator-initial-mode = <NPM1300_BUCK_MODE_PWM>;'
            : ''
    }
    ${
        buck.modeControl === 'PFM'
            ? '// regulator-initial-mode = <NPM1300_BUCK_MODE_PFM>;'
            : ''
    }
};
`;

// TODO: Reinstate // soft-start-microamp = <${toMilli(ldo.softStart)}>;
const generateLDO = (ldo: LdoExport, ldoModule: LdoModule) => `
npm1300_ek_ldo${ldoModule.index + 1}: LDO${ldoModule.index + 1} {
    regulator-min-microvolt = <${toMicro(ldoModule.ranges.voltage.min)}>;
    regulator-max-microvolt = <${toMicro(ldoModule.ranges.voltage.max)}>;
    ${
        ldo.mode === 'LDO'
            ? `regulator-init-microvolt = <${toMicro(ldo.voltage)}>;`
            : ''
    }
    regulator-initial-mode = <${
        ldo.mode === 'LDO' ? 'NPM1300_LDSW_MODE_LDO' : 'NPM1300_LDSW_MODE_LDSW'
    }>;
    ${
        ldo.onOffControl !== 'SW'
            ? `enable-gpios = <&npm1300_ek_gpio ${GPIOValues.findIndex(
                  v => v === ldo.onOffControl
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${ldo.enabled ? 'regulator-boot-on;' : ''}
};
`;

const generateLEDs = (leds: LED[]) => `
npm1300_ek_leds: leds {
    compatible = "nordic,npm1300-led";
    ${leds
        .map(
            (led, index) =>
                `nordic,led${index}-mode = "${ledModeToOverlay(led.mode)}";`
        )
        .join('    \n')}
};
`;

const generateMfd = (ship?: ShipModeConfig) =>
    ship
        ? `
    // long-press-reset = "${ship.longPressReset}";
    // ship-to-active-time = <${ship.timeToActive}>;
`
        : '';

export default (npmConfig: NpmExport, npmDevice: NpmDevice) => `/*
* Copyright (C) 2023 Nordic Semiconductor ASA
* SPDX-License-Identifier: Apache-2.0
*/

#include <dt-bindings/regulator/npm1300.h>
#include <zephyr/dt-bindings/input/input-event-codes.h>

&arduino_i2c {
   npm1300_ek_pmic: pmic@6b {
       compatible = "nordic,npm1300";
       reg = <0x6b>;

       ${generateMfd(npmConfig.ship)}

       npm1300_ek_gpio: gpio-controller {
           compatible = "nordic,npm1300-gpio";
           gpio-controller;
           #gpio-cells = <2>;
           ngpios = <5>;
       };

       npm1300_ek_regulators: regulators {
           compatible = "nordic,npm1300-regulator";

           ${npmConfig.bucks
               .map((buck, index) =>
                   generateBuck(buck, npmDevice.buckModule[index])
               )
               .join('\n\n')}

            ${npmConfig.ldos
                .map((ldos, index) =>
                    generateLDO(ldos, npmDevice.ldoModule[index])
                )
                .join('\n\n')}
       };

       ${generateCharger(npmConfig.charger)}

       ${generateLEDs(npmConfig.leds)}
   };
};`;
