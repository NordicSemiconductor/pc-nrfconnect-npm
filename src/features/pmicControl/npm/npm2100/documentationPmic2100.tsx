/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { Documentation } from '../types';

const boostDoc = () => ({
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
    ModeControl: [
        {
            title: 'Mode Control',
            content: [
                <p key="p1">
                    Configure the BOOST mode.
                    <ul className="tw-ml-6 tw-list-disc">
                        <li>
                            Auto - BOOST automatically choose mode depending on
                            load.
                        </li>
                        <li>
                            Auto no HP - same as Auto, except BOOST is blocked
                            from entering the High Power (HP) mode.
                        </li>
                        <li>
                            High Power - highest output current capability (150
                            mA).
                        </li>
                        <li>Low Power - used for lower loads (10 mA).</li>
                        <li>
                            Pass-through - used when BOOST output voltage is
                            wanted at the same level as the battery voltage.
                        </li>
                    </ul>
                </p>,
            ],
        },
    ],
    PinSelection: [
        {
            title: 'GPIO Control - Pin Selection',
            content: [
                <p key="p1">
                    Configure the GPIO pin and polarity for the BOOST mode
                    control.
                </p>,
            ],
        },
    ],
    ModeSelection: [
        {
            title: 'GPIO Control - Mode Selection',
            content: [
                <p key="p1">
                    Configure the GPIO mode selected in GPIO Control – Pin
                    Selection.
                </p>,
            ],
        },
    ],
    OvercurrentProtection: [
        {
            title: 'Overcurrent Protection',
            content: [
                <p key="p1">
                    Enable overcurrent protection for the BOOST pass-through
                    mode (325 mA).
                </p>,
            ],
        },
    ],
    VOUT: [
        {
            title: 'VOUT',
            content: [
                <p key="p1">Set the BOOST output voltage level.</p>,
                <p key="p2">
                    When the VSET pin is used to set the voltage level, this
                    indicates the voltage level at VOUT (read-only). When
                    software is used to set the voltage level, this has value
                    between 1.8 V to 3.3 V in 50-mV steps.
                </p>,
            ],
        },
    ],
});

const ldoDoc = () => ({
    LoadSwitchLDO: [
        {
            title: 'Load Switch/LDO',
            content: [
                <p key="p1">
                    The load switch is supplied by the BOOST and can either
                    function as a switch or as an LDO. It supports an output
                    voltage range between 0.8 V and 3.0 V in 50-mV steps, and a
                    maximum output current of 50 mA.
                </p>,
            ],
        },
    ],
    SoftStartCurrent: [
        {
            title: 'Load Switch/LDO Soft Start Current',
            content: [
                <p key="p1">Configure Load Switch/LDO Soft Start Current.</p>,
            ],
        },
    ],
    ModeControl: [
        {
            title: 'Mode',
            content: [
                <p key="p1">
                    Configure the Load Switch/LDO mode.
                    <ul className="tw-ml-6 tw-list-disc">
                        <li>
                            Auto - The device operating mode determines the Load
                            Switch/LDO mode.
                        </li>
                        <li>
                            Active - The device is in the High Power (HP) mode.
                            This mode has the highest output current capability
                            (50 mA).
                        </li>
                        <li>
                            Hibernate - The device is in the Ultra-Low Power
                            (ULP) mode. This mode is used for lower loads (2
                            mA).
                        </li>
                        <li>
                            GPIO - use if you want a GPIO to control the mode.
                        </li>
                    </ul>
                </p>,
            ],
        },
    ],
    PinMode: [
        {
            title: 'Pin Mode',
            content: [
                <p key="p1">Configure the GPIO mode selected in Pin Select.</p>,
            ],
        },
    ],
    PinSelect: [
        {
            title: 'Pin Select',
            content: [
                <p key="p1">
                    Configure the GPIO pin and polarity for the Load Switch/LDO
                    mode control.
                </p>,
            ],
        },
    ],
    LdoRampEnabled: [
        {
            title: 'LDO Ramp',
            content: [
                <p key="p1">
                    Enable VOUT<sub>LDO</sub> to ramp up step-by-step.
                </p>,
            ],
        },
    ],
    OcpEnabled: [
        {
            title: 'Overcurrent Protection',
            content: [
                <p key="p1">
                    Enable overcurrent protection at the level configured in the
                    Load Switch Soft Start Current drop-down menu. Only valid
                    when Load Switch/LDO is in the High Power mode.
                </p>,
            ],
        },
    ],
    HaltEnabled: [
        {
            title: 'LDO Halt',
            content: [
                <p key="p1">
                    Enable halt of VOUT<sub>LDO</sub> ramping in case of a V
                    <sub>INT</sub> droop.
                </p>,
            ],
        },
    ],
});

const gpioDoc = () => ({
    Mode: [
        {
            title: 'Mode',
            content: [
                <p key="p1">
                    Configure the GPIO mode. Modes available are:
                    <ul className="tw-ml-6 tw-list-disc">
                        <li>
                            Input
                            <ul className="tw-ml-6 tw-list-disc">
                                <li>General purpose</li>
                                <li>
                                    Input control for BOOST and Load Switch/LDO
                                </li>
                            </ul>
                        </li>
                        <li>Output</li>
                        <li>Interrupt output</li>
                    </ul>
                </p>,
            ],
        },
    ],
    Pull: [
        {
            title: 'Pull',
            content: [
                <p key="p1">
                    Configure GPIO pull-up (50 kΩ), GPIO pull-down (500 kΩ), or
                    pull disabled.
                </p>,
            ],
        },
    ],
    Drive: [
        {
            title: 'Drive',
            content: [
                <p key="p1">
                    Configure the GPIO drive strength: Normal (2 mA) or High (4
                    mA).
                </p>,
            ],
        },
    ],
    OpenDrain: [
        {
            title: 'Open Drain',
            content: [<p key="p1">Enable the GPIO open drain.</p>],
        },
    ],
    Debounce: [
        {
            title: 'Debounce',
            content: [<p key="p1">Enable the GPIO input debounce.</p>],
        },
    ],
});

export const documentation: Documentation = {
    battery: {
        FuelGauge: [
            {
                title: 'Fuel Gauge',
                content: [
                    <p key="p1">
                        Battery voltage and temperature is used to accurately
                        calculate the battery&apos;s State of Charge.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [<p key="p1">0% to 100%, in 0.1% steps</p>],
            },
        ],
        StateOfCharge: [
            {
                title: 'State of Charge',
                content: [
                    <p key="p1">
                        Battery voltage and temperature is used to accurately
                        calculate the battery&apos;s State of Charge.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [<p key="p1">0% to 100%, in 0.1% steps</p>],
            },
        ],
        DiscardPositiveDeltaZ: [
            {
                title: 'Allow State of Charge to increase',
                content: [
                    <p key="p1">
                        Enable or disable allowing State of Charge to increase.
                    </p>,
                    <p key="p2">
                        It is recommended to have this option enabled during
                        evaluation to see how the fuel gauge performs in varying
                        conditions.
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
    Boost0: boostDoc(),
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
                                <b>Battery</b> - any battery connected to
                                nPM2100&apos;s VBAT, including a battery add-on
                                board.
                            </li>
                            <li>
                                <b>USB</b> - powered by the nPM2100 EK&apos;s
                                USB. The USB supplies the nPM2100 PMIC through
                                an LDO. Available voltages are 1.5 V or 3.0 V,
                                configurable by a jumper.
                            </li>
                        </ul>
                    </p>,
                ],
            },
        ],
    },
    ldo1: ldoDoc(),
    gpio0: gpioDoc(),
    gpio1: gpioDoc(),
    resetControl: {
        LongPressResetSelectPin: [
            {
                title: 'Reset Pin Selection',
                content: [
                    <p key="p1">
                        Configure the pin to be used for reset control.
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>PG/Reset - default pin.</li>
                            <li>
                                SHPHLD - for a so called single-button
                                configuration.
                            </li>
                        </ul>
                    </p>,
                ],
            },
        ],
        LongPressResetEnable: [
            {
                title: 'Long Press Reset',
                content: [
                    <p key="p1">
                        Configure whether to enable or disable Long Press Reset.
                        Enabled by default.
                    </p>,
                ],
            },
        ],
        LongPressResetDebounce: [
            {
                title: 'Long Press Reset Debounce',
                content: [
                    <p key="p1">
                        Configure the Long Press Reset debounce time:
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>5 s</li>
                            <li>10 s (default)</li>
                            <li>20 s</li>
                            <li>30 s</li>
                        </ul>
                    </p>,
                ],
            },
        ],
        PowerCycle: [
            {
                title: 'Power Cycle',
                content: [
                    <p key="p1">
                        Press to reset the device and perform a power cycle.
                    </p>,
                ],
            },
        ],
        ResetCause: [
            {
                title: 'Reset Cause',
                content: [
                    <p key="p1">
                        Reason for previous reset. One of the following:
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>Cold power-up</li>
                            <li>Thermal shutdown</li>
                            <li>Boot monitor</li>
                            <li>Long-press reset</li>
                            <li>Watchdog reset</li>
                            <li>Watchdog power cycle</li>
                            <li>Software reset</li>
                            <li>Hibernate exit button</li>
                            <li>Hibernate exit timer</li>
                            <li>Hibernate_PT exit button</li>
                            <li>Hibernate_PT exit timer</li>
                            <li>Power on/off button</li>
                            <li>Ship mode exit</li>
                            <li>Overcurrent protection</li>
                        </ul>
                    </p>,
                ],
            },
        ],
    },
    lowPowerControl: {
        PowerButtonEnable: [
            {
                title: 'Power OFF Button',
                content: [
                    <p key="p1">
                        Enable power off button (default: enabled). Pressing the
                        SHPHLD button for 2 s will put the device in the Ship
                        Mode.
                    </p>,
                ],
            },
        ],
        TimeToActive: [
            {
                title: 'tSHPHLD_DEB_HIB',
                content: [
                    <p key="p1">
                        Configure the SHPHLD pin debounce time, that is the
                        amount of time you need to push down the SHPHLD button
                        for nPM2100 to wake up from hibernate and the
                        hibernate_pt mode.
                    </p>,
                ],
            },
        ],
        EnterShipMode: [
            {
                title: 'Enter Ship Mode',
                content: [
                    <p key="p1">
                        Press for nPM2100 to enter the Ship Mode. Wake up
                        nPM2100 by pressing the SHPHLD button for 1 s (typ). The
                        ship mode is the lowest power consumption mode (35 nA).
                    </p>,
                ],
            },
        ],
        EnterHibernateMode: [
            {
                title: 'Enter Hibernate Mode',
                content: [
                    <p key="p1">
                        Press for nPM2100 to enter the hibernate mode.
                    </p>,
                    <p key="p2">
                        In the hibernate mode, BOOST is running in ultra-low
                        power mode, VOUT is discharged, but Load Switch/LDO can
                        be enabled.
                    </p>,
                    <p key="p3">
                        Wake up nPM2100 by pressing the SHPHLD button for
                        tSHPHLD_DEB_HIB (typ), or at timer wake-up. If you want
                        timer used as a wake-up source, make sure to configure
                        the following:
                        <ul className="tw-ml-6 tw-list-decimal">
                            <li>Timer set in Timer Mode &gt; Wake up.</li>
                            <li>
                                Timer Period set at the desired wake-up period.
                            </li>
                            <li>Start Timer enabled in the Timer card.</li>
                        </ul>
                    </p>,
                ],
            },
        ],
        EnterHibernatePTMode: [
            {
                title: 'Enter Hibernate PT Mode',
                content: [
                    <p key="p1">
                        Press for nPM2100 to enter the hibernate PT mode.
                    </p>,
                    <p key="p2">
                        In the hibernate PT mode, BOOST is running in
                        pass-through mode, mode, VOUT is discharged, and Load
                        Switch/LDO is disabled.
                    </p>,
                    <p key="p3">
                        Wake up nPM2100 by pressing the SHPHLD button for
                        tSHPHLD_DEB_HIB (typ), or at timer wake-up. If you want
                        timer used as a wake-up source, make sure to configure
                        the following:
                        <ul className="tw-ml-6 tw-list-decimal">
                            <li>Timer set in Timer Mode &gt; Wake up.</li>
                            <li>
                                Timer Period set at the desired wake-up period.
                            </li>
                            <li>Start Timer enabled in the Timer card.</li>
                        </ul>
                    </p>,
                ],
            },
        ],
        EnterBreakToWakeMode: [
            {
                title: 'Enter Break-to-wake Mode',
                content: [
                    <p key="p1">
                        Press for nPM2100 to enter the break-to-wake mode.
                    </p>,
                    <p key="p2">
                        In the Break-to-wake Mode, the behavior is similar to
                        the Ship Mode. Unlike the Ship Mode, Break-to-wake
                        expects a wire to be connected between the SHPHLD pin
                        and GND. When this wire is disconnected, nPM2100 wakes
                        up. The power consumption is the same as in the Ship
                        Mode, with the addition of a configurable pull-up
                        current across the SHPHLD wire.
                    </p>,
                ],
            },
        ],
    },
    timer: {
        TimeState: [
            {
                title: 'Start Timer',
                content: [
                    <p key="p1">Start or stop the timer (default: stopped).</p>,
                ],
            },
        ],
        TimeMode: [
            {
                title: 'Timer Mode',
                content: [
                    <p key="p1">
                        Select Timer mode of operation:
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>General Purpose (default)</li>
                            <li>Watchdog Reset</li>
                            <li>Watchdog Power Cycle</li>
                            <li>
                                Wake-up (from the hibernate and the hibernate PT
                                modes)
                            </li>
                        </ul>
                    </p>,
                ],
            },
        ],
        TimePeriod: [
            {
                title: 'Timer Period',
                content: [
                    <p key="p1">
                        Configure Timer period. Range: 16 ms to three days
                        (259,200,000 ms).
                    </p>,
                ],
            },
        ],
    },
};
