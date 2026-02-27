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
    NpmExportLatest,
    NTCThermistor,
    USBPowerExport,
} from '../types';
import { GPIOMode1300 } from './gpio/types';
import type Npm1300 from './pmic1300Device';

const toMicro = (value: number) => value * 1000000;
const toMilli = (value: number) => value * 1000;

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

const generateCharger = (
    deviceType: string,
    charger: Charger,
    vbus: USBPowerExport,
) =>
    charger
        ? `
${deviceType}_ek_charger: charger {
    compatible = "nordic,${deviceType}-charger";
    
    vbus-limit-microamp = <${
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        toMicro(vbus.currentLimiter!)
    }>; 
    thermistor-ohms = <${thermistorTypeToOverlay(charger.ntcThermistor)}>;
    thermistor-beta = <${charger.ntcThermistor === 'Ignore NTC' ? '0' : charger.ntcBeta}>;

    thermistor-cold-millidegrees = <${toMilli(charger.tCold)}>;
    thermistor-cool-millidegrees = <${toMilli(charger.tCool)}>;
    thermistor-warm-millidegrees = <${toMilli(charger.tWarm)}>;
    thermistor-hot-millidegrees = <${toMilli(charger.tHot)}>;

    ${charger.enabled ? 'charging-enable;' : ''}
    trickle-microvolt = <${toMicro(charger.vTrickleFast)}>;
    ${charger.enableVBatLow ? 'vbatlow-charge-enable;' : ''}
    ${charger.enableRecharging ? '' : 'disable-recharge;'}

    dietemp-resume-millidegrees = <${toMilli(charger.tChgResume)}>;
    dietemp-stop-millidegrees = <${toMilli(charger.tChgStop)}>;

    term-microvolt = <${toMicro(charger.vTerm)}>;
    term-warm-microvolt = <${toMicro(charger.vTermR)}>;
    current-microamp = <${toMicro(charger.iChg / 1000)}>;
  
    ${
        charger.iBatLim
            ? `dischg-limit-microamp = <${toMicro(charger.iBatLim / 1000)}>;`
            : ''
    } 
    term-current-percent = <${charger.iTerm}>; 
};`
        : '';

const buckInitialMode = (buck: BuckExport) => {
    switch (buck.modeControl) {
        case 'Auto':
            return `regulator-initial-mode = <NPM13XX_BUCK_MODE_${buck.modeControl.toUpperCase()}>;`;
    }
};

const generateBuck = (
    buck: BuckExport,
    buckModule: BuckModule,
    deviceType: string,
) => `
${deviceType}_buck${buckModule.index + 1}: BUCK${buckModule.index + 1} {
    ${buck.enabled ? 'regulator-boot-on;' : ''}
    regulator-min-microvolt = <${toMicro(buckModule.ranges.voltage.min)}>;
    regulator-max-microvolt = <${toMicro(buckModule.ranges.voltage.max)}>;
    ${
        buck.mode !== 'vSet'
            ? `regulator-init-microvolt =  <${toMicro(buck.vOutNormal)}>;`
            : ''
    }
    ${buckInitialMode(buck)}
    retention-microvolt = <${toMicro(buck.vOutRetention)}>;
    ${
        buck.onOffControl !== 'Off'
            ? `enable-gpio-config = <${GPIOValues.findIndex(
                  v => v === buck.onOffControl,
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${
        buck.modeControl.startsWith('GPIO')
            ? ` pwm-gpio-config = <${GPIOValues.findIndex(
                  v => v === buck.modeControl,
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }
    ${
        buck.retentionControl !== 'Off'
            ? `retention-gpio-config = <${GPIOValues.findIndex(
                  v => v === buck.retentionControl,
              )} GPIO_ACTIVE_HIGH>;`
            : ''
    }   
    ${buck.activeDischarge ? 'active-discharge;' : ''}   
};
`;

// TODO: Reinstate // soft-start-microamp = <${toMilli(ldo.softStart)}>;
const generateLDO = (
    ldo: LdoExport,
    ldoModule: LdoModule,
    deviceType: string,
) => `
${deviceType}_ldo${ldoModule.index + 1}: LDO${ldoModule.index + 1} {
    ${ldo.enabled ? 'regulator-boot-on;' : ''}
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
            ? `enable-gpios-config = <${GPIOValues.findIndex(
                  v => v === ldo.onOffControl,
              )} GPIO_ACTIVE_HIGH>;` // Is this correct?
            : ''
    }
    ${ldo.ldoSoftStart ? `soft-start-microamp = <${toMicro(Number.parseInt(ldo.ldoSoftStart, 10))}>;` : ''}
    ${ldo.activeDischarge ? 'active-discharge;' : ''}
};
`;

const generateLEDs = (leds: LED[], deviceType: string) => `
${deviceType}_leds: leds {
    compatible = "nordic,${deviceType}-led";
    ${leds
        .map(
            (led, index) =>
                `nordic,led${index}-mode = "${ledModeToOverlay(led.mode)}";`,
        )
        .join('    \n')}
};
`;

const longPressReset = (npmConfig: NpmExportLatest) =>
    npmConfig.reset && 'longPressReset' in npmConfig.reset
        ? `long-press-reset = "${npmConfig.reset.longPressReset.replaceAll('_', '-')}";`
        : '';

export default (npmConfig: NpmExportLatest, npmDevice: Npm1300 | Npm1304) => `/*
* Copyright (C) 2023 Nordic Semiconductor ASA
* SPDX-License-Identifier: Apache-2.0
*/

#include <zephyr/dt-bindings/regulator/npm13xx.h>
#include <zephyr/dt-bindings/gpio/nordic-npm13xx-gpio.h>

&arduino_i2c {
   ${npmDevice.deviceType}_pmic: pmic@6b {
       compatible = "nordic,${npmDevice.deviceType}";
       reg = <0x6b>;

        pmic-int-pin = <3>; // From what i gather we have not UI for this to this is something user has to fill in after generating? 
        ship-to-active-time-ms = <${npmConfig.lowPower?.timeToActive ?? npmDevice.lowPowerModule?.defaults.timeToActive}>;
       ${longPressReset(npmConfig)}

        ${npmDevice.deviceType}_gpio: gpio-controller {
           compatible = "nordic,${npmDevice.deviceType}-gpio";
           gpio-controller;
           #gpio-cells = <2>;
           ngpios = <5>;
       };

       ${npmDevice.deviceType}_regulators: regulators {
           compatible = "nordic,${npmDevice.deviceType}-regulator";

           ${
               // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
               npmConfig
                   .bucks!.map((buck, index) =>
                       generateBuck(
                           buck,
                           npmDevice.buckModule[index],
                           npmDevice.deviceType,
                       ),
                   )
                   .join('\n\n')
           }

            ${npmConfig.ldos
                .map((ldos, index) =>
                    generateLDO(
                        ldos,
                        npmDevice.ldoModule[index],
                        npmDevice.deviceType,
                    ),
                )
                .join('\n\n')}
       };

       
       ${generateCharger(
           npmDevice.deviceType,
           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
           npmConfig.charger!,
           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
           npmConfig.usbPower!,
       )}

       ${generateLEDs(npmConfig.leds, npmDevice.deviceType)}

       
       ${npmDevice.deviceType}_wdt: watchdog {
           compatible = "nordic,${npmDevice.deviceType}-wtd";
           reset-gpios = <&npm1300_gpio 3 GPIO_ACTIVE_LOW>;
            ${
                npmConfig.gpios.some(
                    g => g.mode === GPIOMode1300['Output reset'],
                )
                    ? `reset-gpios = ${npmConfig.gpios
                          .map((g, i) =>
                              g.mode === GPIOMode1300['Output reset']
                                  ? `<&npm1300_gpio ${i} GPIO_ACTIVE_LOW>`
                                  : '',
                          )
                          .join(', ')};` // to sure i got this right
                    : ''
            }
       };
   };
};`;
