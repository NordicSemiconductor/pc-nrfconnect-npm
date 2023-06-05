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
            title: 'Voltage',
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
            title: 'Current',
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
            title: 'Temperature',
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
        ChargingMode: {
            title: 'Charging Mode',
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
        TimeToFull: {
            title: 'Time to full',
            description: (
                <p>
                    Uses charge profile and rate of change in state-of-charge to
                    estimate time to battery is full in hours and minutes.
                </p>
            ),
        },
        TimeToEmpty: {
            title: 'Time to empty',
            description: (
                <p>
                    Uses load profile and rate of change in state-of-charge to
                    estimate time to battery is empty in hours and minutes.
                </p>
            ),
        },
        FuelGauge: {
            title: 'Fuel gauge',
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
            title: 'Charger',
            description: (
                <p>
                    JEITA compliant linear charger for Li-ion, Li-poly, and
                    LiFePO4 battery chemistries. Bidirectional power FET for
                    dynamic power-path management.
                </p>
            ),
        },
        VTERM: {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">TERM</span>
                </>
            ),
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
            title: (
                <>
                    <span>I</span>
                    <span className="subscript">CHG</span>
                </>
            ),
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
        EnableRecharging: {
            title: 'Enable Recharging',
            description: (
                <p>
                    After charging is completed and V
                    <span className="subscript">BAT</span> decreases below V
                    <span className="subscript">RECHARGE</span> (95% of V
                    <span className="subscript">TERM</span>) automatic recharge
                    is started when enabled (and charger is enabled).
                </p>
            ),
        },
        ITERM: {
            title: (
                <>
                    <span>I</span>
                    <span className="subscript">TERM</span>
                </>
            ),
            description: (
                <p>
                    Sets the charging termination current level in % of I
                    <span className="subscript">CHG</span>, either 10% (default)
                    or 20%. When charging mode is “Constant Voltage”, the
                    current flow into the battery is monitored. When the current
                    drops below I<span className="subscript">TERM</span>{' '}
                    charging is complete.
                </p>
            ),
        },
        VTrickleFast: {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">TRICKLE_FAST</span>
                </>
            ),
            description: (
                <p>
                    Sets the V<span className="subscript">BAT</span> level where
                    the charger goes from trickle charging to constant current
                    charging. Available voltage levels are 2.9V (default) and
                    2.5V.
                </p>
            ),
        },
    },
    ldo1: {
        LoadSwitchLDO: {
            title: 'Load Switch/LDO',
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
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">OUTLDO1</span>
                </>
            ),
            description: (
                <>
                    <p>LDO output voltage level.</p>
                    <p className="title font-weight-bold">Range</p>
                    <p>1.0V to 3.3V in 100mV steps</p>
                </>
            ),
        },
    },
    ldo2: {
        LoadSwitchLDO: {
            title: 'Load Switch/LDO',
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
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">OUTLDO2</span>
                </>
            ),
            description: (
                <>
                    <p>LDO output voltage level.</p>
                    <p className="title font-weight-bold">Range</p>
                    <p>1.0V to 3.3V in 100mV steps</p>
                </>
            ),
        },
    },
    buck1: {
        Buck: {
            title: 'Buck',
            description: (
                <p>
                    Ultra-high efficiency step-down buck regulator. Supports up
                    to 200mA output current.
                </p>
            ),
        },
        VOUT: {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">OUT1</span>
                </>
            ),
            description: (
                <>
                    <p>BUCK output voltage level.</p>
                    <p>
                        When V<span className="subscript">SET1</span> pin is
                        used to set voltage level this indicates the voltage
                        level at V<span className="subscript">OUT1</span> (read
                        only).
                    </p>
                    <p>
                        When software is used to set voltage level the range is
                        1.0V to 3.3V in 100mV steps.
                    </p>
                </>
            ),
        },
        RETVOUT: {
            title: (
                <>
                    <span>RET</span>
                    <span className="subscript">VOUT1</span>
                </>
            ),
            description: (
                <p>
                    Configures the retention/sleep mode voltage level of the
                    BUCK. A GPIO can be configured to select between RET
                    <span className="subscript">VOUT1</span> and V
                    <span className="subscript">OUT1</span> BUCK voltage level.
                    The GPIO[n] to control this is configured below in
                    “Retention control”.
                </p>
            ),
        },
        ModeControl: {
            title: 'Buck Mode Control',
            description: (
                <p>
                    Configures BUCK mode. The BUCK can be in forced PFM
                    (hysteretic) mode, forced PWM (pulse width modulation) mode
                    or automatic mode (default). In automatic mode the BUCK
                    selects PFM mode for low load currents, and PWM mode for
                    high load currents, to ensure highest efficiency across the
                    whole load current range. PWM mode can be enabled and
                    disabled using a GPIO pin if GPIO[n] is selected.
                </p>
            ),
        },
        OnOffControl: {
            title: 'On/Off Control',
            description: (
                <p>
                    BUCK on or off can be controlled by software, V
                    <span className="subscript">SET1</span> pin or a GPIO pin.
                </p>
            ),
        },
        RetentionControl: {
            title: 'Retention control',
            description: (
                <p>
                    A GPIO can be configured to select between two voltage
                    levels. For example, a GPIO can be set to correspond with
                    active/normal and retention/sleep states of the host. V
                    <span className="subscript">OUT1</span> sets the BUCK output
                    voltage level in active/normal mode, while RET
                    <span className="subscript">VOUT1</span> sets the BUCK
                    output voltage level in retention/sleep mode.
                </p>
            ),
        },
    },
    buck2: {
        Buck: {
            title: 'Buck',
            description: (
                <p>
                    Ultra-high efficiency step-down buck regulator. Supports up
                    to 200mA output current.
                </p>
            ),
        },
        VOUT: {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">OUT2</span>
                </>
            ),
            description: (
                <>
                    <p>BUCK output voltage level.</p>
                    <p>
                        When V<span className="subscript">SET2</span> pin is
                        used to set voltage level this indicates the voltage
                        level at V<span className="subscript">OUT2</span> (read
                        only).
                    </p>
                    <p>
                        When software is used to set voltage level the range is
                        1.0V to 3.3V in 100mV steps.
                    </p>
                </>
            ),
        },
        RETVOUT: {
            title: (
                <>
                    <span>RET</span>
                    <span className="subscript">VOUT1</span>
                </>
            ),
            description: (
                <p>
                    Configures the retention/sleep mode voltage level of the
                    BUCK. A GPIO can be configured to select between RET
                    <span className="subscript">VOUT2</span> and V
                    <span className="subscript">OUT2</span> BUCK voltage level.
                    The GPIO[n] to control this is configured below in
                    “Retention control”.
                </p>
            ),
        },
        ModeControl: {
            title: 'Buck Mode Control',
            description: (
                <p>
                    Configures BUCK mode. The BUCK can be in forced PFM
                    (hysteretic) mode, forced PWM (pulse width modulation) mode
                    or automatic mode (default). In automatic mode the BUCK
                    selects PFM mode for low load currents, and PWM mode for
                    high load currents, to ensure highest efficiency across the
                    whole load current range. PWM mode can be enabled and
                    disabled using a GPIO pin if GPIO[n] is selected.
                </p>
            ),
        },
        OnOffControl: {
            title: 'On/Off Control',
            description: (
                <p>
                    BUCK on or off can be controlled by software, V
                    <span className="subscript">SET2</span> pin or a GPIO pin.
                </p>
            ),
        },
        RetentionControl: {
            title: 'Retention control',
            description: (
                <p>
                    A GPIO can be configured to select between two voltage
                    levels. For example, a GPIO can be set to correspond with
                    active/normal and retention/sleep states of the host. V
                    <span className="subscript">OUT2</span> sets the BUCK output
                    voltage level in active/normal mode, while RET
                    <span className="subscript">VOUT2</span> sets the BUCK
                    output voltage level in retention/sleep mode.
                </p>
            ),
        },
    },
    SidePanel: {
        ActiveBatteryModel: {
            title: 'Active Battery Model',
            description: (
                <p>
                    Select the battery model to be used for evaluation. If you
                    don’t have a battery model of the battery used, you can
                    select the one best matching the capacity of battery used.
                    This will not give best state-of-charge accuracy, but
                    enables easy initial evaluation of fuel gauge.
                </p>
            ),
        },
        LoadBatteryModel: {
            title: 'Load Battery Model',
            description: (
                <p>
                    Lets you load a battery model to start evaluating fuel gauge
                    in nPM PowerUP.
                </p>
            ),
        },
        ProfileBattery: {
            title: 'Profile Battery',
            description: (
                <>
                    <p>
                        Battery profiling is done to provide accurate
                        state-of-charge estimation across voltage, current and
                        temperature range for the specific battery used. The
                        outcome of the battery profiling is a battery model,
                        that can be evaluated in nPM PowerUP by using the “Load
                        Battery Model” option.
                    </p>
                    <p>
                        An addition board, nPM-FG, is required to perform
                        battery profiling. Please connect this to nPM1300-EK
                        before starting battery profiling.
                    </p>
                    <p>
                        The battery model can also be included in the NCS or
                        bare-metal project to do further testing and development
                        on a Nordic nRF SoC development kit or custom HW. Refer
                        to NCS documentation for more details:{' '}
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/samples/pmic/native/npm1300_fuel_gauge/README.html"
                        >
                            nPM1300: Fuel gauge — nRF Connect SDK 2.3.99
                            documentation
                        </a>
                    </p>
                </>
            ),
        },
        ExportConfiguration: {
            title: (
                <span>
                    Export Configuration
                    <br />
                    (Coming Soon!)
                </span>
            ),
            description: (
                <p>
                    Exports the full configuration of the nPM1300 based on the
                    settings in nPM PowerUP. You can select to export to NCS or
                    to a bare-metal project. This also saves the nPM PowerUP
                    configuration, to make it easy to pick up from where you
                    left by using the “Load Configuration” option.
                </p>
            ),
        },
        LoadConfiguration: {
            title: (
                <span>
                    Load Configuration
                    <br />
                    (Coming Soon!)
                </span>
            ),
            description: (
                <p>
                    Loads a saved nPM PowerUP configuration and updates all
                    device configurations accordingly.
                </p>
            ),
        },
        ResetDevice: {
            title: 'Reset Device',
            description: (
                <p>
                    This will reset the nPM1300 and nPM Controller. The nPM1300
                    configuration will go back to default device configuration.
                </p>
            ),
        },
        RecordEvents: {
            title: 'Record Events',
            description: (
                <p>
                    This will record all terminal log events, including commands
                    executed and battery voltage, current temperature, voltage,
                    state-of-charge, time to empty and time to full in csv
                    files.
                </p>
            ),
        },
    },
};
