/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { Documentation } from '../types';

const boostDoc = (index: number) => ({
    Boost: [
        {
            title: 'Boost',
            content: [
                <p key="p1">
                    Ultra-high efficiency BOOST regulator. Supports up to 150 mA
                    output current.
                </p>,
            ],
        },
    ],
    VOUT: [
        {
            title: 'VOUT',
            content: [
                <p key="p1">
                    BOOST output voltage level. When the VSET pin is used to set
                    the voltage level, this indicates the voltage level at VOUT
                    (read only). When software is used to set the voltage level,
                    this has value between 1.8 V to 3.3 V in 50-mV steps.
                </p>,
            ],
        },
    ],
});

export const documentation: Documentation = {
    battery: {
        FuelGauge: [
            {
                title: 'Fuel gauge',
                content: [
                    <p key="p1">
                        Battery voltage and temperature is used to accurately
                        calculate the battery state-of-charge. Range: 0% to
                        100%, in 0.1% steps.
                    </p>,
                ],
            },
        ],
    },
    batteryStatus: {
        Voltage: [
            {
                title: 'Voltage',
                content: [
                    <p key="p1">
                        Battery voltage, VBAT, measured by nPM2100’s ADC.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [<p key="p1">0.70 V to 3.40 V</p>],
            },
        ],
        SystemTemperature: [
            {
                title: 'System temperature',
                content: [
                    <p key="p1">
                        nPM2100 die temperature, measured by nPM2100’s ADC.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [<p key="p1">-20 °C to 85 °C</p>],
            },
        ],
    },
    Boost0: boostDoc(1),
    sidePanel: {
        PowerSource: [
            {
                title: 'POWER SOURCE',
                content: [
                    <p key="p1">
                        Shows what power source is powering nPM2100. This is
                        controlled by nPM2100 EK’s VBAT SEL switch. The
                        following values are possible:
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>
                                - <b>Battery</b> - any battery connected to
                                nPM2100&apos;s VBAT, including a battery add-on
                                board.
                            </li>
                            <li>
                                - <b>USB</b> - powered by the nPM2100 EK’s USB.
                                The USB supplies the nPM2100 PMIC through an
                                LDO. Available voltages are 1.5 V or 3.0 V,
                                configurable by a jumper.
                            </li>
                        </ul>
                    </p>,
                ],
            },
        ],
    },
    ldo1: {
        LoadSwitchLDO: [
            {
                title: 'Load Switch/LDO',
                content: [
                    <p key="p1">
                        The load switch can either function as a switch or LDO
                        and is supplied by the BOOST. It supports an output
                        voltage range from 0.8 V and 3.0 V in 50-mV steps and a
                        maximum output current of 50 mA.
                    </p>,
                ],
            },
        ],
    },
};
