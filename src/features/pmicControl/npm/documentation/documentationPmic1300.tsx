/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { Documentation } from '../types';

export const documentation: Documentation = {
    batteryStatus: {
        Voltage: {
            description: (
                <>
                    <p>
                        Battery voltage, V<span className="subscript">BAT</span>
                        , measured by nPM1300’s ADC.
                    </p>
                    <p className="title font-weight-bold">
                        Range (V<span className="subscript">BATOP</span>):
                    </p>
                    <p>2.3V to 4.45V</p>
                </>
            ),
        },
        Current: {
            description: (
                <>
                    <p>
                        Battery current, I<span className="subscript">BAT</span>
                        , measured by nPM1300’s ADC.
                    </p>
                    <p>
                        Positive value indicates the battery is being loaded,
                        while a negative value indicates the battery is being
                        charged.
                    </p>
                    <p className="title font-weight-bold">Range discharging</p>
                    <p>0mA to -1340mA</p>
                    <p className="title font-weight-bold">Range charging</p>
                    <p>32mA – 800mA</p>
                </>
            ),
        },
        Temperature: {
            description: (
                <>
                    <p>
                        Battery temperature, T
                        <span className="subscript">BAT</span>, measured by
                        nPM1300’s ADC.
                    </p>
                    <p className="title font-weight-bold">Range</p>
                    <p>-40°C to 85°C</p>
                </>
            ),
        },
        'Charging Mode': {
            description: (
                <>
                    <p>Shows the charger’s charging mode.</p>
                    <p className="title font-weight-bold">Trickle</p>
                    <p>
                        Charging mode for batteries at low voltage, V
                        <span className="subscript">BAT</span> &lt; V
                        <span className="subscript">TRICKLE_FAST</span> (default
                        2.9V). Charging current is 10% of configured I
                        <span className="subscript">CHG</span>.
                    </p>
                    <p className="title font-weight-bold">Constant Current</p>
                    <p>
                        When V<span className="subscript">BAT</span> goes above
                        V<span className="subscript">TRICKLE_FAST </span>
                        constant current charging at configured I
                        <span className="subscript">CHG</span> starts.
                    </p>
                    <p className="title font-weight-bold">Constant Voltage</p>
                    <p>
                        When V<span className="subscript">BAT</span> reaches V
                        <span className="subscript">TERM </span>
                        constant voltage charging starts. The battery voltage is
                        maintained at V<span className="subscript">TERM </span>
                        while monitoring current flow into the battery. When
                        current into the battery drops below I
                        <span className="subscript">TERM</span> (default 10% of
                        I<span className="subscript">CHG</span>) charging is
                        complete.
                    </p>
                    <p>N/A: Charger is not charging.</p>
                </>
            ),
        },
    },
    battery: {
        'Time to full': {
            description: (
                <p>
                    Uses charge profile and rate of change in state-of-charge to
                    estimate time to battery is full in hours and minutes.
                </p>
            ),
        },
        'Time to empty': {
            description: (
                <p>
                    Uses load profile and rate of change in state-of-charge to
                    estimate time to battery is empty in hours and minutes.
                </p>
            ),
        },
        'Fuel Gauge': {
            description: (
                <>
                    <p>
                        Battery voltage, current and temperature is used to
                        accurately calculate the battery state-of-charge.
                    </p>
                    <p className="title font-weight-bold">Range</p>
                    <p>0% to 100%, in 0.1% steps</p>
                </>
            ),
        },
    },
    charger: {
        Charger: {
            description: (
                <p>
                    JEITA compliant linear charger for Li-ion, Li-poly, and
                    LiFePO4 battery chemistries. Bidirectional power FET for
                    dynamic power-path management.
                </p>
            ),
        },
        VTERM: {
            description: (
                <>
                    <p>
                        Charger termination voltage. This is the maximum battery
                        voltage allowed. When V
                        <span className="subscript">BAT</span> reaches this
                        level, the charger goes from constant current to
                        constant voltage charging mode. V
                        <span className="subscript">TERM</span> should be
                        configured according to specification of battery used.
                    </p>
                    <p className="title font-weight-bold">Range</p>
                    <p>3.50V to 3.65V, and 4.00V to 4.45V in 50mV step</p>
                </>
            ),
        },
        ICHG: {
            description: (
                <>
                    <p>
                        Charging current limit. I
                        <span className="subscript">CHG</span> should be
                        configured according to specification of battery used.
                    </p>
                    <p className="title font-weight-bold">Range</p>
                    <p>32mA to 800mA in 2mA steps</p>
                </>
            ),
        },
    },
    'ldo 1': {
        'Load Switch/LDO': {
            description: (
                <>
                    <p>
                        The load switch can either function as a switch or LDO.
                    </p>
                    <p>
                        As a switch it supports an input voltage range from 1.0V
                        to 5.5V and up to 100mA.
                    </p>
                    <p>
                        As a LDO it supports an input voltage range from 2.6V to
                        5.5V, and output voltage range from 1.0V and 3.3V in
                        100mV steps up to 50mA.
                    </p>
                </>
            ),
        },
        VOUTLDO: {
            description: (
                <>
                    <p>LDO output voltage level.</p>
                    <p className="title font-weight-bold">Range</p>
                    <p>1.0V to 3.3V in 100mV steps</p>
                </>
            ),
        },
    },
    'ldo 2': {
        'Load Switch/LDO': {
            description: (
                <>
                    <p>
                        The load switch can either function as a switch or LDO.
                    </p>
                    <p>
                        As a switch it supports an input voltage range from 1.0V
                        to 5.5V and up to 100mA.
                    </p>
                    <p>
                        As a LDO it supports an input voltage range from 2.6V to
                        5.5V, and output voltage range from 1.0V and 3.3V in
                        100mV steps up to 50mA.
                    </p>
                </>
            ),
        },
        VOUTLDO: {
            description: (
                <>
                    <p>LDO output voltage level.</p>
                    <p className="title font-weight-bold">Range</p>
                    <p>1.0V to 3.3V in 100mV steps</p>
                </>
            ),
        },
    },
    'buck 1': {
        Buck: {
            description: (
                <p>
                    Ultra-high efficiency step-down buck regulator. Supports up
                    to 200mA output current.
                </p>
            ),
        },
        VOUT: {
            description: (
                <>
                    <p>BUCK output voltage level.</p>
                    <p>
                        When V<span className="subscript">SET</span> pin is used
                        to set voltage level this indicates the voltage level at
                        V<span className="subscript">OUT</span> (read only).
                    </p>
                    <p>
                        When software is used to set voltage level the range is
                        1.0V to 3.3V in 100mV steps.
                    </p>
                </>
            ),
        },
    },
    'buck 2': {
        Buck: {
            description: (
                <p>
                    Ultra-high efficiency step-down buck regulator. Supports up
                    to 200mA output current.
                </p>
            ),
        },
        VOUT: {
            description: (
                <>
                    <p>BUCK output voltage level.</p>
                    <p>
                        When V<span className="subscript">SET</span> pin is used
                        to set voltage level this indicates the voltage level at
                        V<span className="subscript">OUT</span> (read only).
                    </p>
                    <p>
                        When software is used to set voltage level the range is
                        1.0V to 3.3V in 100mV steps.
                    </p>
                </>
            ),
        },
    },
};
