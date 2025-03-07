/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BoostExport,
    BoostModule,
    LdoExport,
    LdoModule,
    NpmExportLatest,
} from '../types';
import type Npm2100 from './pmic2100Device';

const toMicro = (value: number) => value * 1000000;
// const toMilli = (value: number) => value * 1000;

const generateBoost = (
    boost: BoostExport,
    boostModule: BoostModule
) => `npm2100ek_boost: BOOST {
                regulator-min-microvolt = <${toMicro(
                    boostModule.ranges.voltage.min
                )}>;
                regulator-max-microvolt = <${toMicro(
                    boostModule.ranges.voltage.min
                )}>;
                regulator-init-microamp = <0>;
                pwm-mode-gpios = <&npm2100ek_gpio 0 (GPIO_ACTIVE_LOW | GPIO_PULL_UP)>;
            };
`;

const generateLDOSW = (ldo: LdoExport, ldoModule: LdoModule) =>
    `npm2100ek_ldosw: LDOSW {
                regulator-min-microvolt = <${toMicro(
                    ldoModule.ranges.voltage.min
                )}>;
                regulator-max-microvolt = <${toMicro(
                    ldoModule.ranges.voltage.max
                )}>;
                regulator-init-microvolt = <${toMicro(ldo.voltage)}>;
                ${ldo.enabled ? 'regulator-boot-on;' : ''}
                ${
                    ldo.mode === 'Load_switch' || ldo.modeControl === 'gpio'
                        ? `regulator-initial-mode: <${
                              ldo.mode === 'Load_switch'
                                  ? 'NPM2100_REG_LDSW_EN'
                                  : ''
                          }${
                              ldo.mode === 'Load_switch' &&
                              ldo.modeControl === 'gpio'
                                  ? ' | '
                                  : ''
                          }${
                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                              ldo.pinMode!.includes('OFF')
                                  ? 'NPM2100_REG_OPER_OFF'
                                  : 'NPM2100_REG_FORCE_ULP'
                          } | ${
                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                              ldo.pinMode!.includes('HP')
                                  ? 'NPM2100_REG_FORCE_HP'
                                  : 'NPM2100_REG_FORCE_ULP'
                          }>;`
                        : ''
                }
                mode-gpios = <&npm2100ek_gpio ${
                    ldo.pinSel?.includes('1') ? '1' : '0'
                } ${
        ldo.pinSel?.endsWith('LO')
            ? '(GPIO_ACTIVE_LOW | GPIO_PULL_UP)'
            : '(GPIO_ACTIVE_HIGH | GPIO_PULL_DOWN)'
    }>;
            };
`;

export default (npmConfig: NpmExportLatest, npmDevice: Npm2100) => `/*
* Copyright (C) 2025 Nordic Semiconductor ASA
* SPDX-License-Identifier: Apache-2.0
*/

#include <dt-bindings/regulator/npm2100.h>
#include <zephyr/dt-bindings/input/input-event-codes.h>

&arduino_i2c {
    npm2100ek_pmic: pmic@74 {
        compatible = "nordic,npm2100";
        reg = <0x74>;

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
                    generateBoost(boost, npmDevice.boostModule[index])
                )
                .join('\n\n')}

            ${npmConfig.ldos
                .map((ldos, index) =>
                    generateLDOSW(ldos, npmDevice.ldoModule[index])
                )
                .join('\n\n')}
        };

        npm2100ek_wdt: watchdog {
            compatible = "nordic,npm2100-wdt";
        };

        npm2100ek_vbat: vbat {
            compatible = "nordic,npm2100-vbat";
        };
   };
};`;
