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
                        , measured by PMIC’s ADC.
                    </p>
                    <p className="title font-weight-bold">
                        Range (V<span className="subscript">BATOP</span>)
                    </p>
                    <p>2.3 V to 4.45 V</p>
                </>
            ),
        },
        Current: {
            title: 'Current',
            description: (
                <>
                    <p>
                        Battery current, I<span className="subscript">BAT</span>
                        , measured by PMIC’s ADC.
                    </p>
                    <p>
                        The current measurement is designed to satisfy the
                        requirements of the fuel gauge algorithm. It is not
                        intended to be used for accurate current measurements.
                    </p>
                    <p>
                        A positive value indicates a load on the battery - it is
                        discharging, while a negative value indicates that the
                        battery is being charged.
                    </p>
                    <p className="title font-weight-bold">Range discharging</p>
                    <p>0 mA to 1340 mA</p>
                    <p className="title font-weight-bold">Range charging</p>
                    <p>-32 mA to -800 mA</p>
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
                        PMIC’s ADC.
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
                    <p>The charger’s charging mode.</p>
                    <p className="title font-weight-bold">Trickle</p>
                    <p>
                        Charging mode for batteries at low voltage, V
                        <span className="subscript">BAT</span> &lt; V
                        <span className="subscript">TRICKLE_FAST</span> (default
                        2.9 V). Charging current is 10% of configured I
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
                        constant voltage, charging starts. The battery voltage
                        is maintained at V
                        <span className="subscript">TERM </span>
                        while monitoring current flow into the battery. When
                        current into the battery drops below I
                        <span className="subscript">TERM</span> (by default 10%
                        of I<span className="subscript">CHG</span>) charging is
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
                    Load profile and rate of change of state-of-charge is used
                    to estimate time until battery is full, in hours and
                    minutes.
                </p>
            ),
        },
        TimeToEmpty: {
            title: 'Time to empty',
            description: (
                <p>
                    Load profile and rate of change of state-of-charge is used
                    to estimate time until battery is empty, in hours and
                    minutes.
                </p>
            ),
        },
        FuelGauge: {
            title: 'Fuel gauge',
            description: (
                <>
                    <p>
                        Battery voltage, current, and temperature is used to
                        calculate the battery state-of-charge.
                    </p>
                    <p className="title font-weight-bold">Range</p>
                    <p>0% to 100%, in 0.1% steps</p>
                    <p className="title font-weight-bold">Note</p>
                    <p>
                        nPM1300 fuel gauge algorithm incorporate internal
                        adjustments to correct any initialization errors
                        resulting from unrelaxed battery and unexpected reset
                        conditions. These errors typically have a minor impact
                        and the predictions will converge to the accurate value
                        within a few minutes of normal operation.
                    </p>
                </>
            ),
        },
        StateOfCharge: {
            title: 'State Of Charge',
            description: (
                <>
                    <p>
                        Battery voltage, current, and temperature is used to
                        calculate the battery state-of-charge.
                    </p>
                    <p className="title font-weight-bold">Range</p>
                    <p>0% to 100%, in 0.1% steps</p>
                    <p className="title font-weight-bold">Note</p>
                    <p>
                        nPM1300 fuel gauge algorithm incorporate internal
                        adjustments to correct any initialization errors
                        resulting from unrelaxed battery and unexpected reset
                        conditions. These errors typically have a minor impact
                        and the predictions will converge to the accurate value
                        within a few minutes of normal operation.
                    </p>
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
                        Charger termination voltage is the maximum battery
                        voltage allowed. When V
                        <span className="subscript">BAT</span> reaches this
                        level, the charger changes from constant current to
                        constant voltage charging mode. V
                        <span className="subscript">TERM</span> should be
                        configured according to your battery specification.
                    </p>
                    <p className="title font-weight-bold">Range</p>
                    <p>3.50 V to 3.65 V, and 4.00 V to 4.45 V, in 50mV steps</p>
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
                        configured according to your battery specification.
                    </p>
                    <p className="title font-weight-bold">Range</p>
                    <p>32 mA to 800 mA, in 2 mA steps</p>
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
                    is started, if enabled (and if charger is enabled).
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
                    Sets the charging termination current level as a % of I
                    <span className="subscript">CHG</span>, either 10% (default)
                    or 20%. When the charging mode is “Constant Voltage”, the
                    current flow into the battery is monitored. When the current
                    drops below I<span className="subscript">TERM</span> ,
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
                    charging. Available voltage levels are 2.9 V (default) and
                    2.5 V.
                </p>
            ),
        },
        NTCThermistor: {
            title: <span>NTC thermistor</span>,
            description: (
                <p>
                    The charger supports three NTC thermistors for battery
                    temperature monitoring. The available options are 10 kΩ, 47
                    kΩ, 100 kΩ, or no NTC thermistor. If no NTC thermistor is
                    chosen, the NTC pin must be connected to GND and the battery
                    pack must have a thermal fuse for safety.
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
                        The load switch can function either as a switch or an
                        LDO.
                    </p>
                    <p>
                        As a switch it supports an input voltage range from 1.0
                        V to 5.5 V, and up to 100mA.
                    </p>
                    <p>
                        As an LDO it supports an input voltage range from 2.6 V
                        to 5.5 V, and output voltage range from 1.0 V to 3.3 V,
                        in 100 mV steps up to 50 mA.
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
                    <p>1.0 V to 3.3 V, in 100 mV steps</p>
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
                        The load switch can function either as a switch or an
                        LDO.
                    </p>
                    <p>
                        As a switch, it supports an input voltage range from 1.0
                        V to 5.5 V, and up to 100 mA.
                    </p>
                    <p>
                        As an LDO, it supports an input voltage range from 2.6 V
                        to 5.5 V, and an output voltage range from 1.0 V to 3.3
                        V, in 100 mV steps up to 50 mA.
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
                    <p>1.0 V to 3.3 V in 100 mV steps</p>
                </>
            ),
        },
    },
    buck1: {
        Buck: {
            title: 'Buck',
            description: (
                <p>
                    Ultra-high efficiency step-down buck regulator. Supports
                    output current up to 200 mA .
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
                        1.0 V to 3.3 V, in 100 mV steps.
                    </p>
                </>
            ),
        },
        RETVOUT: {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">RET1</span>
                </>
            ),
            description: (
                <p>
                    Configures the retention/sleep mode voltage level of the
                    BUCK. A GPIO can be configured to select between V
                    <span className="subscript">RET1</span> and V
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
                    (hysteretic) mode, forced PWM (pulse width modulation) mode,
                    or automatic mode (default). In automatic mode the BUCK
                    selects PFM mode for low load currents, and PWM mode for
                    high load currents, to ensure the highest efficiency across
                    the whole load current range. PWM mode can be enabled and
                    disabled using a GPIO pin if GPIO[n] is selected.
                </p>
            ),
        },
        OnOffControl: {
            title: 'On/Off Control',
            description: (
                <p>
                    BUCK on or off can be controlled by software, V
                    <span className="subscript">SET1</span> pin, or a GPIO pin.
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
                    to 200 mA output current.
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
                        from 1.0 V to 3.3 V, in 100 mV steps.
                    </p>
                </>
            ),
        },
        RETVOUT: {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">RET2</span>
                </>
            ),
            description: (
                <p>
                    Configures the retention/sleep mode voltage level of the
                    BUCK. A GPIO can be configured to select between V
                    <span className="subscript">RET2</span> and V
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
    sidePanel: {
        ActiveBatteryModel: {
            title: 'Active Battery Model',
            description: (
                <p>
                    Select the battery model to be used for evaluation. If you
                    don’t find your battery model in the list, you can select
                    the one best matching the capacity of your battery. This
                    will not give best state-of-charge accuracy, but enables
                    easy initial evaluation of the fuel gauge.
                </p>
            ),
        },
        WriteBatteryModel: {
            title: 'Write Battery Model',
            description: (
                <p>
                    You can write a battery model to start evaluating the nPM
                    PowerUP fuel gauge.
                </p>
            ),
        },
        ProfileBattery: {
            title: 'Profile Battery',
            description: (
                <>
                    <p>
                        Battery profiling provides accurate state-of-charge
                        estimation across voltage, current, and temperature
                        range for the specific battery used. The result of the
                        battery profiling is a battery model which can be
                        evaluated in nPM PowerUP by using the Write Battery
                        Model” option.
                    </p>
                    <p>
                        An additional board, nPM-FG, is required to perform
                        battery profiling. This must be connected to EK before
                        battery profiling is started.
                    </p>
                    <p>
                        The battery model can also be included in the NCS or
                        bare-metal project for further testing and development
                        on a Nordic nRF SoC development kit or custom hardware.
                        Refer to NCS documentation for more details:{' '}
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
                    Exports the full configuration of the PMIC based on the nPM
                    PowerUP settings. You can choose to export to NCS or to a
                    bare-metal project. This also saves the nPM PowerUP
                    configuration, making it easy to resume by using the “Load
                    Configuration” option.
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
                    Resets the PMIC and nPM Controller. The PMIC default device
                    configuration is restored.
                </p>
            ),
        },
        RecordEvents: {
            title: 'Record Events',
            description: (
                <p>
                    Records all terminal log events, including commands
                    executed, battery voltage, current temperature, voltage,
                    state-of-charge, time to empty and time to full in csv
                    files.
                </p>
            ),
        },
    },
    profiling: {
        DischargeCutOff: {
            title: 'Discharge cut-off',
            description: (
                <p>
                    The lowest battery operating voltage. Set this according to
                    the battery specification.
                </p>
            ),
        },
        Capacity: {
            title: 'Capacity',
            description: (
                <p>
                    The battery capacity in mAh. Set this according to the rated
                    capacity of the battery used.
                </p>
            ),
        },
        Temperature: {
            title: 'Temperature',
            description: (
                <>
                    <p>
                        The battery profiling temperatures. Temperatures between
                        0°C to 60°C, in steps of 1°C, are supported.
                    </p>
                    <p>
                        We recommend profiling at three temperatures for best
                        state-of-charge accuracy. For example, if your
                        application temperature range is 5°C to 45°C, we
                        recommend profiling at 5°C, 25°C, and 45°C.
                    </p>
                </>
            ),
        },
    },
};
