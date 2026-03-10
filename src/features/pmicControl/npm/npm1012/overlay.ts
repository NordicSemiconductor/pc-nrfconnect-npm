/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LED, LEDMode, NpmExportLatest } from '../types';
import type Npm1012 from './pmic1012Device';

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

const generateLEDs = (leds: LED[], deviceType: string) => `
${deviceType}_ek_leds: leds {
    compatible = "nordic,${deviceType}-led";
    ${leds
        .map(
            (led, index) =>
                `nordic,led${index}-mode = "${ledModeToOverlay(led.mode)}";`,
        )
        .join('    \n')}
};
`;

export default (npmConfig: NpmExportLatest, npmDevice: Npm1012) => `/*
* Copyright (C) 2025 Nordic Semiconductor ASA
* SPDX-License-Identifier: Apache-2.0
*/

#include <dt-bindings/regulator/npm10xx.h>
#include <zephyr/dt-bindings/input/input-event-codes.h>

&arduino_i2c {
   ${npmDevice.deviceType}_ek_pmic: pmic@6b {
       compatible = "nordic,${npmDevice.deviceType}";
       reg = <0x6b>;

       ${generateLEDs(npmConfig.leds, npmDevice.deviceType)}
   };
};`;
