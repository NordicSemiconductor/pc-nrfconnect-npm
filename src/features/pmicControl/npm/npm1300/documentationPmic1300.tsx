/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ExternalLink } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { Documentation } from '../types';

const buckDoc = (n: number) => ({
    Buck: [
        {
            title: 'Buck',
            content: [
                <p key="p1">
                    Ultra-high efficiency step-down buck regulator. Supports
                    output current up to 200 mA.
                </p>,
            ],
        },
    ],
    VOUT: [
        {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">{`OUT${n}`}</span>
                </>
            ),
            content: [
                <p key="p1">BUCK output voltage level.</p>,
                <p key="p2">
                    When V<span className="subscript">{`SET${n}`}</span> pin is
                    used to set voltage level this indicates the voltage level
                    at V<span className="subscript">{`OUT${n}`}</span> (read
                    only).
                </p>,
                <p key="p3">
                    When software is used to set voltage level, the range is 1.0
                    V to 3.3 V, in 100-mV steps.
                </p>,
            ],
        },
    ],
    RETVOUT: [
        {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">{`RET${n}`}</span>
                </>
            ),
            content: [
                <p key="p1">
                    Configures the retention/sleep mode voltage level of the
                    BUCK. A GPIO can be configured to select between V
                    <span className="subscript">{`RET${n}`}</span> and V
                    <span className="subscript">{`OUT${n}`}</span> BUCK voltage
                    level. The GPIO[n] to control this is configured below in
                    “Retention control”.
                </p>,
            ],
        },
    ],
    ActiveOutputCapacitorDischarge: [
        {
            title: 'Active Output Capacitor Discharge',
            content: [
                <p key="p1">
                    Active discharge using R
                    <span className="subscript">DISCH</span> from the output
                    capacitors when the converter is disabled.
                </p>,
            ],
        },
    ],
    ModeControl: [
        {
            title: 'Buck Mode Control',
            content: [
                <p key="p1">
                    Configures BUCK mode. The BUCK can be in the forced PFM
                    (hysteretic) mode, the forced PWM (pulse width modulation)
                    mode, or in the automatic mode (default). In the automatic
                    mode, the BUCK selects the PFM mode for low load currents,
                    and the PWM mode for high load currents, to ensure the
                    highest efficiency across the whole load current range. The
                    PWM mode can be enabled and disabled using a GPIO pin if
                    GPIO[n] is selected.
                </p>,
            ],
        },
    ],
    OnOffControl: [
        {
            title: 'On/Off Control',
            content: [
                <p key="p1">
                    BUCK on or off can be controlled by software, V
                    <span className="subscript">{`SET${n}`}</span> pin, or a
                    GPIO pin.
                </p>,
            ],
        },
    ],
    RetentionControl: [
        {
            title: 'Retention control',
            content: [
                <p key="p1">
                    A GPIO can be configured to select between two voltage
                    levels. For example, a GPIO can be set to correspond with
                    active/normal and retention/sleep states of the host. V
                    <span className="subscript">{`OUT${n}`}</span> sets the BUCK
                    output voltage level in active/normal mode, while RET
                    <span className="subscript">{`VOUT${n}`}</span> sets the
                    BUCK output voltage level in the retention/sleep mode.
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
                    The load switch can function as either a switch or an LDO.
                </p>,
                <p key="p2">
                    As a switch, it supports an input voltage range from 1.0 V
                    to 5.5 V, and up to 100 mA.
                </p>,
                <p key="p3">
                    As an LDO, it supports an input voltage range from 2.6 V to
                    5.5 V, and an output voltage range from 1.0 V to 3.3 V, in
                    100-mV steps and up to 50 mA.
                </p>,
            ],
        },
    ],
    VOUTLDO: [
        {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">OUTLDO2</span>
                </>
            ),
            content: [<p key="p1">LDO output voltage level.</p>],
        },
        {
            title: 'Range',
            content: [<p key="p1">1.0 V to 3.3 V, in 100-mV steps</p>],
        },
    ],
    SoftStartEnable: [
        {
            title: 'Soft Start Enable',
            content: [
                <p key="p1">
                    Limit the load switch current for 1.8 ms when the load
                    switch is enabled.
                </p>,
            ],
        },
    ],
    SoftStartCurrent: [
        {
            title: 'Soft Start Current',
            content: [<p key="p1">The current limit for the soft start.</p>],
        },
    ],
    ActiveDischarge: [
        {
            title: 'Active Discharge',
            content: [
                <p key="p1">
                    Active discharge using R
                    <span className="subscript">LSPD</span> when the load switch
                    is disabled.
                </p>,
            ],
        },
    ],
});

const gpioDoc = (n: number) => ({
    Mode: [
        {
            title: 'Mode',
            content: [
                <p key="p1">Selects the GPIO mode. Available options are:</p>,
                <p key="p2">
                    <strong>Input</strong> – In this mode, {`GPIO${n}`} is used
                    to control the BUCKs or Load Switches. Refer to the
                    respective controls to configure what {`GPIO${n}`} should
                    control. The {`GPIO${n}`} can also be used as a
                    general-purpose input in this mode.
                </p>,
                <p key="p3">
                    <strong>Input Rising Edge</strong> – In this mode,{' '}
                    {`GPIO${n}`} is used to generate an event on the rising
                    edge.
                </p>,
                <p key="p4">
                    <strong>Input Falling Edge</strong> – In this mode,{' '}
                    {`GPIO${n}`} is used to generate an event on the falling
                    edge.
                </p>,
                <p key="p5">
                    <strong>Output High</strong> – Sets {`GPIO${n}`} output
                    high.
                </p>,
                <p key="p6">
                    <strong>Out Low</strong> – Sets {`GPIO${n}`} output low.
                </p>,
                <p key="p7">
                    <strong>Output Interrupt</strong> – Configures {`GPIO${n}`}{' '}
                    to issue an interrupt. The wanted interrupts must be enabled
                    in “Interrupt Configuration”.
                </p>,
                <p key="p8">
                    <strong>Output Reset</strong> – Configure {`GPIO${n}`} as
                    Reset (NRESETOUT) from the watchdog.
                </p>,
                <p key="p9">
                    <strong>Output POF</strong> – Configure {`GPIO${n}`} to
                    issue a warning when a power loss occurs. Requires POF
                    warning to be enabled.
                </p>,
            ],
        },
    ],
    Pull: [
        {
            title: 'Pull',
            content: [<p key="p1">Enable pull-up or pull-down.</p>],
        },
    ],
    Drive: [
        {
            title: 'Drive Strength',
            content: [
                <p key="p1">
                    Set output drive strength. Available options are:
                </p>,
                <p key="p2">1 mA (default) or 6 mA</p>,
            ],
        },
    ],
    OpenDrain: [
        {
            title: 'Open Drain',
            content: [<p key="p1">Enable or Disable Open Drain.</p>],
        },
    ],
    Debounce: [
        {
            title: 'Debounce',
            content: [<p key="p1">Enable or Disable input debounce.</p>],
        },
    ],
});

export const documentation: Documentation = {
    batteryStatus: {
        Voltage: [
            {
                title: 'Voltage',
                content: [
                    <p key="p1">
                        Battery voltage, V<span className="subscript">BAT</span>
                        , measured by PMIC’s ADC.
                    </p>,
                ],
            },
            {
                title: (
                    <>
                        Range (V<span className="subscript">BATOP</span>)
                    </>
                ),
                content: [<p key="p1">2.3 V to 4.45 V </p>],
            },
        ],
        Current: [
            {
                title: 'Current',
                content: [
                    <p key="p1">
                        Battery current, I<span className="subscript">BAT</span>
                        , measured by PMIC’s ADC.
                    </p>,
                    <p key="p2">
                        The current measurement is designed to satisfy the
                        requirements of the fuel gauge algorithm. It is not
                        intended to be used for accurate current measurements.
                    </p>,
                    <p key="p3">
                        A positive value indicates a load on the battery (it is
                        discharging), while a negative value indicates that the
                        battery is being charged.
                    </p>,
                ],
            },
            {
                title: 'Range discharging',
                content: [<p key="p1">0 mA to 1340 mA</p>],
            },
            {
                title: 'Range charging',
                content: [<p key="p1">-32 mA to -800 mA</p>],
            },
        ],
        Temperature: [
            {
                title: 'Temperature',
                content: [
                    <p key="p1">
                        Battery temperature, T
                        <span className="subscript">BAT</span>, measured by
                        PMIC’s ADC.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [<p key="p1">-40°C to 85°C</p>],
            },
        ],
        ChargingMode: [
            {
                title: 'Charging Mode',
                content: [<p key="p1">The charger’s charging mode.</p>],
            },
            {
                title: 'Trickle',
                content: [
                    <p key="p1">
                        Charging mode for batteries at low voltage, V
                        <span className="subscript">BAT</span> &lt; V
                        <span className="subscript">TRICKLE_FAST</span> (default
                        2.9 V). Charging current is 10% of configured I
                        <span className="subscript">CHG</span>.
                    </p>,
                ],
            },
            {
                title: 'Constant Current',
                content: [
                    <p key="p1">
                        When V<span className="subscript">BAT</span> goes above
                        V<span className="subscript">TRICKLE_FAST </span>
                        constant current charging at configured I
                        <span className="subscript">CHG</span> starts.
                    </p>,
                ],
            },
            {
                title: 'Constant Voltage',
                content: [
                    <p key="p1">
                        When V<span className="subscript">BAT</span> reaches V
                        <span className="subscript">TERM </span>
                        constant voltage, the charging starts. The battery
                        voltage is maintained at V
                        <span className="subscript">TERM </span>
                        while monitoring current flow into the battery. When the
                        current into the battery drops below I
                        <span className="subscript">TERM</span> (by default 10%
                        of I<span className="subscript">CHG</span>), the
                        charging is complete.
                    </p>,
                    <p key="p2">N/A: Charger is not charging.</p>,
                ],
            },
        ],
    },
    battery: {
        TimeToFull: [
            {
                title: (
                    <span>
                        Time to full
                        <br />
                        (Experimental)
                    </span>
                ),
                content: [
                    <p key="p1">
                        Load profile and the rate of change of state-of-charge
                        are used to estimate the time until the battery is full,
                        in hours and minutes.
                    </p>,
                ],
            },
        ],
        TimeToEmpty: [
            {
                title: (
                    <span>
                        Time to empty
                        <br />
                        (Experimental)
                    </span>
                ),
                content: [
                    <p key="p1">
                        Load profile and the rate of change of state-of-charge
                        are used to estimate the time until the battery is
                        empty, in hours and minutes.
                    </p>,
                ],
            },
        ],
        FuelGauge: [
            {
                title: 'Fuel gauge',
                content: [
                    <p key="p1">
                        Battery voltage, current, and temperature are used to
                        calculate the battery’s state-of-charge.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [<p key="p1">0% to 100%, in 0.1% steps</p>],
            },
            {
                title: 'Note',
                content: [
                    <p key="p1">
                        The nPM1300 fuel gauge algorithm adjusts to correct for
                        possible initialization errors due to a stressed battery
                        or unexpected reset conditions. Typically, the impact of
                        these errors is minor and the predictions will converge
                        to an accurate value within a few minutes of normal
                        operation.
                    </p>,
                ],
            },
        ],
        StateOfCharge: [
            {
                title: 'State Of Charge',
                content: [
                    <p key="p1">
                        Battery voltage, current, and temperature are used to
                        calculate the battery state-of-charge.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [<p key="p1">0% to 100%, in 0.1% steps</p>],
            },

            {
                title: 'Note',
                content: [
                    <p key="p1">
                        The nPM1300 fuel gauge algorithm adjusts to correct for
                        possible initialization errors due to a stressed battery
                        or unexpected reset conditions. Typically, the impact of
                        these errors is minor and the predictions will converge
                        to an accurate value within a few minutes of normal
                        operation.
                    </p>,
                ],
            },
        ],
    },
    powerFailure: {
        PowerFailure: [
            {
                title: 'Power Failure',
                content: [
                    <p key="p1">
                        The power-fail comparator (POF) provides the host with
                        an early warning of an impending power supply failure.
                        The POF signals the application when the supply voltage
                        drops below VSYS<span className="subscript">POF</span>{' '}
                        threshold. The POF does not reset the system, but gives
                        the CPU time to prepare for an orderly power-down.
                        <br />
                        <br />
                        Enable GPIO Mode “Output power loss warning” for the
                        desired GPIO in the GPIOS tab.
                    </p>,
                ],
            },
        ],
        VSYSPOF: [
            {
                title: (
                    <>
                        VSYS<span className="subscript">POF</span>
                    </>
                ),
                content: [
                    <p key="p1">
                        Threshold to trigger a power failure.
                        <br />
                        <br />
                        Range: 2.6 V to 3.5 V, in 100-mV steps.
                    </p>,
                ],
            },
        ],
        POFPolarity: [
            {
                title: 'POF Polarity',
                content: [
                    <p key="p1">
                        Polarity of the GPIO output configured as “Output power
                        loss warning”.
                    </p>,
                ],
            },
        ],
    },
    timer: {
        Timer: [
            {
                title: 'Timer',
                content: [
                    <p key="p1">
                        TIMER is a 24-bit timer running at the frequency of the
                        timer clock, fTIMER, and has a prescaler. TIMER only
                        runs one timer at a time because it is shared for all
                        functions. The wake-up timer is intended for use during
                        the Hibernate Mode to wake the system up at a
                        programmable interval. The watchdog timer and the
                        general purpose timer are to be used when the system is
                        not in the Ship Mode or the Hibernate Mode.
                    </p>,
                ],
            },
        ],
        TimeMode: [
            {
                title: 'Time Mode',
                content: [
                    <p key="p1">
                        TIMER can be used in different ways, depending on
                        configuration.
                        <br />• General purpose timer
                        <br />• Watchdog warning
                        <br />• Watchdog reset
                        <br />• Wake-up timer (Hibernate Mode)
                        <br />• Boot monitor
                    </p>,
                ],
            },
        ],
        TimePrescaler: [
            {
                title: 'Time Prescaler',
                content: [
                    <p key="p1">
                        Configure timer prescaler. The fast one uses a 2-ms
                        prescaler, while the slow one uses a 16-ms prescaler.
                    </p>,
                ],
            },
        ],
        TimePeriod: [
            {
                title: 'Time Period',
                content: [
                    <p key="p1">
                        Configure the timer period.
                        <br />
                        <br />
                        Range is 2 ms to 9 hours in 2-ms steps in the fast mode,
                        and 16 ms to 3 days in 16-ms steps in the slow mode.
                    </p>,
                ],
            },
        ],
    },
    resetControl: {
        SHPHLDPinPolarity: [
            {
                title: 'SHPHLD pin polarity',
                content: [
                    <p key="p1">
                        Configure polarity of the SHPHLD pin, either Active Low
                        or Active High.
                    </p>,
                ],
            },
        ],
        LongPressReset: [
            {
                title: 'Long Press Reset',
                content: [
                    <p key="p1">
                        A long press (&gt; t
                        <span className="subscript">RESETBUT</span>) of the
                        button causes a power cycle and resets the whole system.
                        This feature is enabled by default after power-up.
                    </p>,
                ],
            },
        ],
        TwoButtonReset: [
            {
                title: 'Two Button Reset',
                content: [
                    <p key="p1">
                        A two-button reset is implemented by connecting one
                        button to the SHPHLD pin and another button to GPIO0.
                    </p>,
                ],
            },
        ],
        EnterShipMode: [
            {
                title: 'Enter Ship Mode',
                content: [
                    <p key="p1">
                        Activate the Ship Mode, isolating the battery from the
                        system to minimize quiescent current. The device wakes
                        up from the Ship Mode either by pulling pin SHPHLD low
                        for a minimum period of t
                        <span className="subscript">ShipToActive</span> or by
                        connecting USB PMIC.
                        <br />
                        <br />
                        On the nPM1300-EK, press the button marked SHPHLD/RESET
                        to wake up the device.
                        <br />
                        <br />
                        USB PMIC cable needs to be disconnected for the device
                        to enter the Ship Mode.
                    </p>,
                ],
            },
        ],
        EnterHibernationMode: [
            {
                title: 'Enter Hibernation Mode',
                content: [
                    <p key="p1">
                        Activate the Hibernate Mode, isolating the battery from
                        the system to minimize quiescent current. The device
                        wakes up from the Hibernate Mode either by pulling the
                        pin SHPHLD low for a minimum period of t
                        <span className="subscript">ShipToActive</span>, by
                        connecting USB PMIC, or from a wake-up timer (if
                        configured).
                        <br />
                        <br />
                        On the nPM1300-EK, press the button marked SHPHLD/RESET
                        to wake up the device.
                        <br />
                        <br />
                        USB PMIC cable needs to be disconnected for the device
                        to enter the Ship Mode.
                    </p>,
                ],
            },
        ],
    },
    vBUS: {
        VBusInputCurrentLimiter: [
            {
                title: (
                    <>
                        V<span className="subscript">BUS</span> input current
                        limiter
                    </>
                ),
                content: [
                    <p key="p1">
                        The VBUS input current limiter manages VBUS current
                        limitation and charger detection for USB Type-C
                        compatible chargers. USB PMIC needs to be disconnected
                        for the device to enter the Ship Mode.
                    </p>,
                ],
            },
        ],
        USBDetectStatus: [
            {
                title: 'USB Detect Status',
                content: [
                    <p key="p1">
                        When the device is plugged into a wall adaptor or an USB
                        power source, the USB port detection runs automatically
                        to detect the USB port max current capabilities.
                        <br />
                        <br />
                        The available USB detect statuses are:
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>USB 100/500 mA</li>
                            <li>1.5 A High Power</li>
                            <li>3 A High Power</li>
                            <li>No USB connection</li>
                        </ul>
                    </p>,
                ],
            },
        ],
        CurrentLimiter: [
            {
                title: 'Current Limiter',
                content: [
                    <p key="p1">
                        There are two USB compliant, accurate current limits:
                        IBUS100MA (100 mA) and IBUS500MA (500 mA). In addition,
                        there are current limits in 100-mA steps from 600 mA to
                        1500 mA. The 1500 mA limit is compatible with USB
                        Type-C. The default current limit is IBUS100MA (100 mA).
                    </p>,
                ],
            },
        ],
    },
    charger: {
        Charger: [
            {
                title: 'Charger',
                content: [
                    <p key="p1">
                        JEITA-compliant linear charger for Li-ion, Li-poly, and
                        LiFePO4 battery chemistries. Bidirectional power FET for
                        dynamic power-path management.
                    </p>,
                ],
            },
        ],
        VTERM: [
            {
                title: (
                    <>
                        <span>V</span>
                        <span className="subscript">TERM</span>
                    </>
                ),
                content: [
                    <p key="p1">
                        Charger termination voltage is the maximum battery
                        voltage allowed. When V
                        <span className="subscript">BAT</span> reaches this
                        level, the charger changes from constant current to
                        constant voltage charging mode. V
                        <span className="subscript">TERM</span> should be
                        configured according to your battery specification.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [
                    <p key="p1">
                        3.50 V to 3.65 V, and 4.00 V to 4.45 V, in 50-mV steps.
                    </p>,
                ],
            },
        ],
        ICHG: [
            {
                title: (
                    <>
                        <span>I</span>
                        <span className="subscript">CHG</span>
                    </>
                ),
                content: [
                    <p key="p1">
                        Charging current limit. I
                        <span className="subscript">CHG</span> should be
                        configured according to your battery specification.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [<p key="p1">32 mA to 800 mA, in 2 mA steps.</p>],
            },
        ],
        EnableRecharging: [
            {
                title: 'Enable Recharging',
                content: [
                    <p key="p1">
                        After the charging is completed and V
                        <span className="subscript">BAT</span> decreases below V
                        <span className="subscript">RECHARGE</span> (95% of V
                        <span className="subscript">TERM</span>), the automatic
                        recharge is started, if enabled (and if the charger is
                        enabled).
                    </p>,
                ],
            },
        ],
        ITERM: [
            {
                title: (
                    <>
                        <span>I</span>
                        <span className="subscript">TERM</span>
                    </>
                ),
                content: [
                    <p key="p1">
                        Sets the charging termination current level as a percent
                        of I<span className="subscript">CHG</span>, either 10%
                        (default) or 20%. When the charging mode is “Constant
                        Voltage”, the current flow into the battery is
                        monitored. When the current drops below I
                        <span className="subscript">TERM</span>, the charging is
                        complete.
                    </p>,
                ],
            },
        ],
        VTrickleFast: [
            {
                title: (
                    <>
                        <span>V</span>
                        <span className="subscript">TRICKLE_FAST</span>
                    </>
                ),
                content: [
                    <p key="p1">
                        Sets the V<span className="subscript">BAT</span> level
                        where the charger goes from trickle charging to constant
                        current charging. Available voltage levels are 2.9 V
                        (default) and 2.5 V.
                    </p>,
                ],
            },
        ],
    },
    ldo1: ldoDoc(),
    ldo2: ldoDoc(),
    buck1: buckDoc(1),
    buck2: buckDoc(2),
    gpio0: gpioDoc(0),
    gpio1: gpioDoc(1),
    gpio2: gpioDoc(2),
    gpio3: gpioDoc(3),
    gpio4: gpioDoc(4),
    chipThermalRegulation: {
        ChargerThermalRegulation: [
            {
                title: 'Charger Thermal Regulation',
                content: [
                    <p key="p1">
                        Configures the die temperature monitoring, which is
                        active during charging.
                    </p>,
                ],
            },
        ],
        Tchgresume: [
            {
                title: (
                    <>
                        <span>T</span>
                        <span className="subscript">CHGRESUME</span>
                    </>
                ),
                content: [
                    <p key="p1">
                        Temperature threshold for charging to resume.
                    </p>,
                ],
            },
        ],
        Tchgstop: [
            {
                title: (
                    <>
                        <span>T</span>
                        <span className="subscript">CHGSTOP</span>
                    </>
                ),
                content: [
                    <p key="p1">Temperature threshold for charging to stop.</p>,
                ],
            },
        ],
        ThermalRegulationActive: [
            {
                title: 'Thermal Regulation Active',
                content: [
                    <p key="p1">
                        <strong>Red light:</strong> Charging stopped,
                        temperature above T
                        <span className="subscript">CHGSTOP</span>.
                    </p>,
                    <p key="p2">
                        <strong>Green light:</strong> Charging ongoing (if
                        enabled), temperature below T
                        <span className="subscript">CHGRESUME</span>.
                    </p>,
                ],
            },
        ],
    },
    JEITA: {
        JEITACompliance: [
            {
                title: 'Tbat Monitoring – JEITA Compliance',
                content: [
                    <p key="p1">
                        This section configures the different battery
                        temperature thresholds according to JEITA. The default
                        values match the JEITA guidelines.
                    </p>,
                ],
            },
        ],
        Vtermr: [
            {
                title: (
                    <>
                        <span>V</span>
                        <span className="subscript">TERMR</span>
                    </>
                ),
                content: [
                    <p key="p1">
                        Set the termination voltage for the “Warm” temperature
                        region. Can be set equal to V
                        <span className="subscript">TERM</span> if reduced
                        termination voltage in “Warm” temperature region is not
                        wanted.
                    </p>,
                ],
            },
        ],
        NTCThermistor: [
            {
                title: 'NTC thermistor',
                content: [
                    <p key="p1">
                        The charger supports three NTC thermistors for battery
                        temperature monitoring. The available options are 10 kΩ,
                        47 kΩ, 100 kΩ, or no NTC thermistor. If no NTC
                        thermistor is chosen, the NTC pin must be connected to
                        GND and the battery pack must have a thermal fuse for
                        safety.
                    </p>,
                ],
            },
        ],
        DefaultNTCBeta: [
            {
                title: 'Default NTC Beta',
                content: [
                    <p key="p1">
                        Use default value for NTC Beta
                        <br />
                        <br />
                        Default:
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>10 kΩ: 3380</li>
                            <li>47 kΩ: 4050</li>
                            <li>100 kΩ: 4250</li>
                        </ul>
                    </p>,
                ],
            },
        ],
        NTCBeta: [
            {
                title: 'NTC Beta',
                content: [
                    <p key="p1">
                        Configure NTC beta value matching battery NTC
                        resistance.
                    </p>,
                ],
            },
        ],
    },
    LED: {
        LED: [
            {
                title: 'LEDs',
                content: [
                    <p key="p1">nPM1300 have three 5-mA LED drivers.</p>,
                    <p key="p2">
                        These can be configured as:
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>Charging indication</li>
                            <li>Charging error indication</li>
                            <li>An RGB LED (using all three LED pins)</li>
                            <li>
                                Output high (open drain, requires external
                                pull-up resistor)
                            </li>
                            <li>
                                Output low (open drain, requires external
                                pull-up resistor)
                            </li>
                        </ul>
                    </p>,
                ],
            },
        ],
    },
    ResetErrorLogs: {
        ResetCause: [
            {
                title: 'Reset Cause',
                content: [
                    <p key="p1">
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>SHIPMODEXIT: Ship Mode exit.</li>
                            <li>BOOTMONITORTIMEOUT: Boot monitor timeout.</li>
                            <li>WATCHDOGTIMEOUT: Watchdog timeout.</li>
                            <li>
                                LONGPRESSTIMEOUT: Long press of the SHPHLD/RESET
                                button.
                            </li>
                            <li>THERMASHUTDOWN: Thermal shutdown.</li>
                            <li>
                                VSYSLOW: POF (Power Failure) or V
                                <span className="subscript">SYS</span> low.
                            </li>
                            <li>SWRESET: Software reset.</li>
                        </ul>
                    </p>,
                ],
            },
        ],
        ChargerErrors: [
            {
                title: 'Charger Errors',
                content: [
                    <p key="p1">
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>NTCSENSORERR: NTC thermistor sensor error.</li>
                            <li>
                                VBATSENSORERR: V
                                <span className="subscript">BAT</span> sensor
                                error.
                            </li>
                            <li>
                                VBATLOW: V<span className="subscript">BAT</span>{' '}
                                low error.
                            </li>
                            <li>VTRICKLE: Vtrickle error.</li>
                            <li>MEASTIMEOUT: Measurement timeout error.</li>
                            <li>CHARGETIMEOUT: Charge timeout error.</li>
                            <li>TRICKLETIMEOUT: Trickle timeout error.</li>
                        </ul>
                    </p>,
                ],
            },
        ],
        SensorErrors: [
            {
                title: 'Sensor Errors',
                content: [
                    <p key="p1">
                        SENSORVTRICKLE: Vtrickle sensor value during error.
                        SENSORVBATLOW: VbatLow sensor value during error.
                        <ul className="tw-ml-6 tw-list-disc">
                            <li>
                                SENSORNTCCOLD: NTC thermistor Cold sensor value
                                during error.
                            </li>
                            <li>
                                SENSORNTCCOOL: NTC thermistor Cool sensor value
                                during error.
                            </li>
                            <li>
                                SENSORNTCHOT: NTC thermistor Hot sensor value
                                during error.
                            </li>
                            <li>
                                SENSORVTERM: V
                                <span className="subscript">term</span> sensor
                                value during error.
                            </li>
                            <li>
                                SENSORRECHARGE: Recharge sensor value during
                                error.
                            </li>
                            <li>
                                SENSORVTRICKLE: V
                                <span className="subscript">trickle</span>{' '}
                                sensor value during error.
                            </li>
                            <li>
                                SENSORVBATLOW: V
                                <span className="subscript">batLow</span> sensor
                                value during error.
                            </li>
                        </ul>
                    </p>,
                ],
            },
        ],
    },
    sidePanel: {
        ActiveBatteryModel: [
            {
                title: 'Active Battery Model',
                content: [
                    <p key="p1">
                        Select a battery model. The battery models cover an
                        operating voltage range of 3.0 V to 4.2 V for the fuel
                        gauge. If your battery model is not in the list, select
                        the model that best matches the capacity of your
                        battery. This will not give the best state-of-charge
                        accuracy but enables easy, initial evaluation of the
                        fuel gauge.
                    </p>,
                ],
            },
        ],
        WriteBatteryModel: [
            {
                title: 'Write Battery Model',
                content: [
                    <p key="p1">
                        You can write a battery model to start evaluating the
                        nPM PowerUP fuel gauge.
                    </p>,
                ],
            },
        ],
        ProfileBattery: [
            {
                title: 'Profile Battery',
                content: [
                    <p key="p1">
                        {`Battery profiling provides accurate state-of-charge
                        estimation across voltage, current, and temperature
                        range for the specific battery used. The result of the
                        battery profiling is a battery model. To evaluate the
                        battery model in nPM PowerUP, use the 'Write Battery
                        Model' option to upload the battery model .json file. To
                        continue development and implementation on your own
                        design, use the battery model .inc file. See the NCS
                        documentation for more details: `}
                        <ExternalLink
                            label=" nPM1300: Fuel gauge — nRF Connect SDK 2.4.99 documentation"
                            href="https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/samples/pmic/native/npm1300_fuel_gauge/README.html#npm1300-fuel-gauge"
                        />
                    </p>,
                    <p key="p2">
                        An additional board, nPM-FG, is required to perform
                        battery profiling. This must be connected to EK before
                        battery profiling is started.
                    </p>,
                ],
            },
        ],
        ExportConfiguration: [
            {
                title: <span>Export Configuration</span>,
                content: [
                    <p key="p1">
                        Exports the nPM1300 configuration based on the nPM
                        PowerUP settings. Choose .overlay to export to a nRF
                        Connect SDK project, or .json to save the nPM PowerUP
                        configuration for later use in nPM PowerUP using the
                        &quot;Load Configuration&quot; option.
                        <br />
                        <br />
                        For more details on how to import the overlay file to
                        the nRF Connect SDK, see{' '}
                        <ExternalLink
                            label="Importing an overlay from nPM PowerUP"
                            href="https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/device_guides/working_with_pmic/npm1300/developing.html"
                        />
                    </p>,
                ],
            },
        ],
        LoadConfiguration: [
            {
                title: 'Load Configuration',
                content: [
                    <p key="p1">
                        Loads a saved nPM PowerUP configuration and updates all
                        device configurations accordingly.
                    </p>,
                ],
            },
        ],
        ResetDevice: [
            {
                title: 'Reset Device',
                content: [
                    <p key="p1">
                        Resets the PMIC and nPM Controller. The PMIC default
                        device configuration is restored.
                    </p>,
                ],
            },
        ],
        RecordEvents: [
            {
                title: 'Record Events',
                content: [
                    <p key="p1">
                        Records all terminal log events in CSV files, including
                        commands executed, battery voltage, current temperature,
                        voltage, state-of-charge, time to empty, and time to
                        full.
                    </p>,
                ],
            },
        ],
    },
    profiling: {
        DischargeCutOff: [
            {
                title: 'Discharge cut-off',
                content: [
                    <p key="p1">
                        The lowest battery operating voltage. Set this according
                        to the battery specification.
                    </p>,
                ],
            },
        ],
        Capacity: [
            {
                title: 'Capacity',
                content: [
                    <p key="p1">
                        The battery capacity in mAh. Set this according to the
                        rated capacity of the battery used.
                    </p>,
                ],
            },
        ],
        Temperature: [
            {
                title: 'Temperature',
                content: [
                    <p key="p1">
                        The battery profiling temperatures. Supported
                        remperatures range from 0°C to 60°C, in steps of 1°C.
                    </p>,
                    <p key="p2">
                        {' '}
                        We recommend profiling at three temperatures for best
                        state-of-charge accuracy. For example, if your
                        application temperature range is 5°C to 45°C, we
                        recommend profiling at 5°C, 25°C, and 45°C.
                    </p>,
                ],
            },
        ],
    },
};
