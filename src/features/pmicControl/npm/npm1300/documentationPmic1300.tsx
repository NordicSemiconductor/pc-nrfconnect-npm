/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ExternalLink } from '@nordicsemiconductor/pc-nrfconnect-shared';

import type Npm1304 from '../npm1304/pmic1304Device';
import { type Documentation } from '../types';
import type Npm1300 from './pmic1300Device';

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
                <p key="p1">Set the BUCK output voltage level.</p>,
                <p key="p2">
                    When V<span className="subscript">{`SET${n}`}</span> pin is
                    used to set the voltage level, this indicates the voltage
                    level at V<span className="subscript">{`OUT${n}`}</span>{' '}
                    (read-only).
                </p>,
                <p key="p3">
                    When software is used to set voltage level, the range is 1.0
                    V to 3.3 V, in steps of 100 mV.
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
                    Configure the retention/sleep mode voltage level of the
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
                    When enabled, active discharge is using R
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
                    Configure the BUCK mode. The BUCK can be in the forced PFM
                    (hysteretic) mode, the forced PWM (pulse width modulation)
                    mode, or in the automatic mode (default).
                </p>,
                <p key="p2">
                    In the automatic mode, the BUCK selects the PFM mode for low
                    load currents, and the PWM mode for high load currents, to
                    ensure the highest efficiency across the whole load current
                    range.
                </p>,
                <p key="p3">
                    The PWM mode can be enabled and disabled using a GPIO pin if
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
                    Setting BUCK on or off can be controlled by software, V
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
                    Select the GPIO[n] to control the retention/sleep mode you
                    set above in <span className="subscript">{`RET${n}`}</span>.
                </p>,
                <p key="p2">
                    A GPIO can be configured to select between two voltage
                    levels. For example, a GPIO can be set to correspond with
                    active/normal and retention/sleep states of the host.
                </p>,
                <p key="p3">
                    V<span className="subscript">{`OUT${n}`}</span> sets the
                    BUCK output voltage level in active/normal mode.
                </p>,
                <p key="p4">
                    RET <span className="subscript">{`VOUT${n}`}</span> sets the
                    BUCK output voltage level in the retention/sleep mode.
                </p>,
            ],
        },
    ],
});

const ldoDoc = (index: number) => ({
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
                    steps of 100 mV and up to 50 mA.
                </p>,
            ],
        },
    ],
    VOUTLDO: [
        {
            title: (
                <>
                    <span>V</span>
                    <span className="subscript">OUTLDO{index}</span>
                </>
            ),
            content: [<p key="p1">Set the LDO output voltage level.</p>],
        },
        {
            title: 'Range',
            content: [<p key="p1">1.0 V to 3.3 V, in steps of 100 mV</p>],
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
            content: [
                <p key="p1">Select the current limit for the soft start.</p>,
            ],
        },
    ],
    ActiveDischarge: [
        {
            title: 'Active Discharge',
            content: [
                <p key="p1">
                    When enabled, active discharge is using R
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
                <p key="p1">Select the GPIO mode:</p>,
                <p key="p2">
                    <strong>Input</strong> - Use {`GPIO${n}`} to control the
                    BUCKs or Load Switches. Refer to the respective controls to
                    configure what {`GPIO${n}`} should control. You can also use{' '}
                    {`GPIO${n}`} as a general-purpose input in this mode.
                </p>,
                <p key="p3">
                    <strong>Input Rising Edge</strong> - Use {`GPIO${n}`} to
                    generate an event on the rising edge.
                </p>,
                <p key="p4">
                    <strong>Input Falling Edge</strong> - Use {`GPIO${n}`} to
                    generate an event on the falling edge.
                </p>,
                <p key="p5">
                    <strong>Output High</strong> - Set {`GPIO${n}`} output high.
                </p>,
                <p key="p6">
                    <strong>Out Low</strong> - Set {`GPIO${n}`} output low.
                </p>,
                <p key="p7">
                    <strong>Output Interrupt</strong> - Configure {`GPIO${n}`}{' '}
                    to issue an interrupt. The wanted interrupts must be enabled
                    in “Interrupt Configuration”.
                </p>,
                <p key="p8">
                    <strong>Output Reset</strong> - Configure {`GPIO${n}`} as
                    Reset (NRESETOUT) from the watchdog.
                </p>,
                <p key="p9">
                    <strong>Output POF</strong> - Configure {`GPIO${n}`} to
                    issue a warning when a power loss occurs. Requires POF
                    warning to be enabled.
                </p>,
            ],
        },
    ],
    Pull: [
        {
            title: 'Pull',
            content: [<p key="p1">Select pull-up or pull-down.</p>],
        },
    ],
    Drive: [
        {
            title: 'Drive Strength',
            content: [
                <p key="p1">
                    Select the output drive strength: 1 mA (default) or 6 mA.
                </p>,
            ],
        },
    ],
    OpenDrain: [
        {
            title: 'Open Drain',
            content: [<p key="p1">Enable or disable Open Drain.</p>],
        },
    ],
    Debounce: [
        {
            title: 'Debounce',
            content: [<p key="p1">Enable or disable the input debounce.</p>],
        },
    ],
});

export const documentation = (npmDevice: Npm1300 | Npm1304): Documentation => {
    const deviceType = npmDevice.deviceType.replace('npm', 'nPM');
    return {
        batteryStatus: {
            Voltage: [
                {
                    title: 'Voltage',
                    content: [
                        <p key="p1">
                            Battery voltage, V
                            <span className="subscript">BAT</span>, measured by
                            PMIC&apos;s ADC.
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
                            Battery current, I
                            <span className="subscript">BAT</span>, measured by
                            PMIC&apos;s ADC.
                        </p>,
                        <p key="p2">
                            The current measurement is designed to satisfy the
                            requirements of the fuel gauge algorithm. It is not
                            intended to be used for accurate current
                            measurements.
                        </p>,
                        <p key="p3">
                            A positive value indicates a load on the battery (it
                            is discharging). A negative value indicates that the
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
                            PMIC&apos;s ADC.
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
                    content: [
                        <p key="p1">The charger&apos;s charging mode.</p>,
                    ],
                },
                {
                    title: 'Trickle',
                    content: [
                        <p key="p1">
                            Charging mode for batteries at low voltage, V
                            <span className="subscript">BAT</span> &lt; V
                            <span className="subscript">TRICKLE_FAST</span>{' '}
                            (default 2.9 V). The charging current is 10% of the
                            configured I<span className="subscript">CHG</span>.
                        </p>,
                    ],
                },
                {
                    title: 'Constant Current',
                    content: [
                        <p key="p1">
                            When V<span className="subscript">BAT</span> goes
                            above V
                            <span className="subscript">TRICKLE_FAST</span>
                            constant current, the charging starts at the
                            configured I<span className="subscript">CHG</span>.
                        </p>,
                    ],
                },
                {
                    title: 'Constant Voltage',
                    content: [
                        <p key="p1">
                            <ul className="tw-ml-6 tw-list-disc">
                                <li>
                                    When V<span className="subscript">BAT</span>{' '}
                                    reaches V
                                    <span className="subscript">TERM </span>
                                    constant voltage, the charging starts. The
                                    battery voltage is maintained at V
                                    <span className="subscript">TERM </span>
                                    while monitoring current flow into the
                                    battery.
                                </li>
                                <li>
                                    When the current into the battery drops
                                    below I
                                    <span className="subscript">TERM</span> (by
                                    default 10% of I
                                    <span className="subscript">CHG</span>), the
                                    charging is complete.
                                </li>
                                <li>N/A - Charger is not charging.</li>
                            </ul>
                        </p>,
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
                            Load profile and the rate of change of State of
                            Charge are used to estimate the time until the
                            battery is full, in hours and minutes.
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
                            Load profile and the rate of change of State of
                            Charge are used to estimate the time until the
                            battery is empty, in hours and minutes.
                        </p>,
                    ],
                },
            ],
            FuelGauge: [
                {
                    title: 'Fuel Gauge',
                    content: [
                        <p key="p1">
                            Battery voltage, current, and temperature are used
                            to calculate the battery&apos;s State of Charge.
                        </p>,
                    ],
                },
                {
                    title: 'Range',
                    content: [<p key="p1">0% to 100%, in steps of 0.1%</p>],
                },
                {
                    title: 'Note',
                    content: [
                        <p key="p1">
                            The {deviceType} fuel gauge algorithm adjusts to
                            correct for possible initialization errors due to a
                            battery under stress or unexpected reset conditions.
                            Typically, the impact of these errors is minor and
                            the predictions will converge to an accurate value
                            within a few minutes of normal operation.
                        </p>,
                    ],
                },
            ],
            StateOfCharge: [
                {
                    title: 'State Of Charge',
                    content: [
                        <p key="p1">
                            Battery voltage, current, and temperature are used
                            to calculate the battery&apos;s State of Charge.
                        </p>,
                    ],
                },
                {
                    title: 'Range',
                    content: [<p key="p1">0% to 100%, in steps of 0.1%</p>],
                },

                {
                    title: 'Note',
                    content: [
                        <p key="p1">
                            The {deviceType} fuel gauge algorithm accounts for
                            possible initialization errors due to a battery
                            under stress or unexpected reset conditions.
                            Typically, the impact of these errors is minor and
                            the predictions will converge to an accurate value
                            within a few minutes of normal operation.
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
                            The power-fail comparator (POF) provides the host
                            with an early warning of an impending power supply
                            failure. The POF signals the application when the
                            supply voltage drops below VSYS
                            <span className="subscript">POF</span> threshold.
                            The POF does not reset the system, but gives the CPU
                            time to prepare for an orderly power-down.
                        </p>,
                        <p key="p2">
                            Enable the GPIO Mode “Output power loss warning” for
                            the desired GPIO in the GPIOs tab.
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
                            Set the threshold to trigger a power failure.
                        </p>,
                    ],
                },
                {
                    title: 'Range',
                    content: [
                        <p key="p1">2.6 V to 3.5 V, in steps of 100 mV.</p>,
                    ],
                },
            ],
            POFPolarity: [
                {
                    title: 'POF Polarity',
                    content: [
                        <p key="p1">
                            Select the polarity of the GPIO output configured as
                            “Output power loss warning”.
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
                            TIMER is a 24-bit timer running at the frequency of
                            the timer clock, fTIMER, and has a prescaler. TIMER
                            only runs one timer at a time because it is shared
                            for all functions. The wake-up timer is intended for
                            use during the Hibernate Mode to wake the system up
                            at a programmable interval. The watchdog timer and
                            the general purpose timer are to be used when the
                            system is not in the Ship Mode or the Hibernate
                            Mode.
                        </p>,
                    ],
                },
            ],
            TimeMode: [
                {
                    title: 'Timer Mode',
                    content: [
                        <p key="p1">Select the Timer Mode.</p>,
                        <p key="p2">
                            TIMER can be used in different ways, depending on
                            configuration:
                            <ul className="tw-ml-6 tw-list-disc">
                                <li>General purpose timer</li>
                                <li>Watchdog warning</li>
                                <li>Watchdog reset</li>
                                <li>Wake-up timer (Hibernate Mode)</li>
                                <li>Boot monitor</li>
                            </ul>
                        </p>,
                    ],
                },
            ],
            TimePrescaler: [
                {
                    title: 'Timer Prescaler',
                    content: [
                        <p key="p1">Select the timer prescaler.</p>,
                        <p key="p2">The fast one uses a 2-ms prescaler.</p>,
                        <p key="p3">The slow one uses a 16-ms prescaler.</p>,
                    ],
                },
            ],
            TimePeriod: [
                {
                    title: 'Timer Period',
                    content: [
                        <p key="p1">Set the timer period.</p>,
                        <p key="p2">
                            For the Timer Fast mode, the range is 2 ms to 9
                            hours, in steps of 2 ms.
                        </p>,
                        <p key="p3">
                            For the Timer Slow mode, the range is 16 ms to 3
                            days, in steps of 16 ms.
                        </p>,
                    ],
                },
            ],
        },
        resetControl: {
            LongPressReset: [
                {
                    title: 'Long Press Reset',
                    content: [
                        <p key="p1">
                            Select an option for how to handle Long Press Reset.
                        </p>,
                        <p key="p2">
                            A long press (&gt; t
                            <span className="subscript">RESETBUT</span>) of the
                            button causes a power cycle and resets the whole
                            system.
                        </p>,
                        <p key="p3">
                            After power-up, this feature is by default set to
                            &quot;one button&quot;.
                        </p>,
                        <p key="p4">
                            When &quot;two buttons&quot; is selected, both
                            SHPHLD and GPIO0 must be pressed simultaneously to
                            trigger a reset.
                        </p>,
                    ],
                },
            ],
        },
        lowPowerControl: {
            EnterShipMode: [
                {
                    title: 'Enter Ship Mode',
                    content: [
                        <p key="p1">
                            Activate the Ship Mode, isolating the battery from
                            the system to minimize quiescent current. The device
                            wakes up from the Ship Mode either by pulling pin
                            SHPHLD low for a minimum period of t
                            <span className="subscript">ShipToActive</span> or
                            by connecting USB PMIC.
                        </p>,
                        <p key="p2">
                            On the {deviceType}-EK, press the button marked
                            SHPHLD/RESET to wake up the device.
                        </p>,
                        <p key="p3">
                            USB PMIC cable needs to be disconnected for the
                            device to enter the Ship Mode.
                        </p>,
                    ],
                },
            ],
            EnterHibernateMode: [
                {
                    title: 'Enter Hibernation Mode',
                    content: [
                        <p key="p1">
                            Activate the Hibernate Mode, isolating the battery
                            from the system to minimize quiescent current. The
                            device wakes up from the Hibernate Mode either by
                            pulling the pin SHPHLD low for a minimum period of t
                            <span className="subscript">ShipToActive</span>, by
                            connecting USB PMIC, or from a wake-up timer (if
                            configured).
                        </p>,
                        <p key="p2">
                            On the {deviceType}-EK, press the button marked
                            SHPHLD/RESET to wake up the device.
                        </p>,
                        <p key="p3">
                            USB PMIC cable needs to be disconnected for the
                            device to enter the Ship Mode.
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
                            V<span className="subscript">BUS</span> input
                            current limiter
                        </>
                    ),
                    content: [
                        <p key="p1">
                            The VBUS input current limiter manages VBUS current
                            limitation and charger detection for USB Type-C
                            compatible chargers. USB PMIC needs to be
                            disconnected for the device to enter the Ship Mode.
                        </p>,
                    ],
                },
            ],
            USBDetectStatus: [
                {
                    title: 'USB Detect Status',
                    content: [
                        <p key="p1">
                            When the device is plugged into a wall adaptor or an
                            USB power source, the USB port detection runs
                            automatically to detect the USB port max current
                            capabilities.
                        </p>,
                        <p key="p2">
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
                        <p key="p1">Set the current limit.</p>,
                        <p key="p2">
                            There are two USB-compliant, accurate current
                            limits: IBUS100MA (100 mA) and IBUS500MA (500 mA).
                            In addition, there are current limits in steps of
                            100 mA, from 600 mA to 1500 mA. The 1500-mA limit is
                            compatible with USB Type-C.
                        </p>,
                        <p key="p3">
                            The default current limit is IBUS100MA (100 mA).
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
                            JEITA-compliant linear charger for Li-ion, Li-poly,
                            and LiFePO4 battery chemistries. Bidirectional power
                            FET for dynamic power-path management.
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
                            Set the charger termination voltage. This is the
                            maximum battery voltage allowed. When V
                            <span className="subscript">BAT</span> reaches this
                            level, the charger changes the charging mode from
                            constant current to constant voltage. Check your
                            battery specification to configure V
                            <span className="subscript">TERM</span> correctly.
                        </p>,
                    ],
                },
                {
                    title: 'Range',
                    content: [
                        <p key="p1">
                            3.50 V to 3.65 V, and 4.00 V to 4.45 V, in steps of
                            50 mV.
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
                            Set the charging current limit. Check your battery
                            specification to configure I
                            <span className="subscript">CHG</span> correctly.
                        </p>,
                    ],
                },
                {
                    title: 'Range',
                    content: [
                        <p key="p1">32 mA to 800 mA, in steps of 2 mA.</p>,
                    ],
                },
            ],
            EnableRecharging: [
                {
                    title: 'Recharging',
                    content: [
                        <p key="p1">Enable or disable recharging.</p>,
                        <p key="p2">
                            If this option and the Charger tile are enabled, the
                            automatic recharge starts every time after the
                            charging is completed and V
                            <span className="subscript">BAT</span> decreases
                            below V<span className="subscript">RECHARGE</span>{' '}
                            (95% of V<span className="subscript">TERM</span>).
                        </p>,
                    ],
                },
            ],
            EnableVBatLow: [
                {
                    title: (
                        <>
                            <span>Charging Below V</span>
                            <span className="subscript">BATLOW</span>
                        </>
                    ),
                    content: [
                        <p key="p1">
                            Enable to allow charging of a heavily discharged
                            battery. This should be configured according to your
                            battery specification.
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
                            Set the charging termination current level as a
                            percent of I<span className="subscript">CHG</span>,
                            either 10% (default) or 20%.
                        </p>,
                        <p key="p2">
                            When the charging mode is “Constant Voltage”, the
                            current flow into the battery is monitored.
                        </p>,
                        <p key="p3">
                            When the current drops below I
                            <span className="subscript">TERM</span>, the
                            charging is complete.
                        </p>,
                    ],
                },
            ],
            IBATLIM: [
                {
                    title: <span>Battery Discharge Current Limit</span>,
                    content: [
                        <p key="p1">
                            For best fuel gauge accuracy, use
                            {` `}
                            <span>IBAT</span>
                            <span className="subscript">LIM_LOW</span> for
                            applications with a lower maximum battery discharge
                            current than 200 mA.
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
                            Set the V<span className="subscript">BAT</span>{' '}
                            level where the charger goes from trickle charging
                            to constant current charging. Available voltage
                            levels are 2.9 V (default) and 2.5 V.
                        </p>,
                    ],
                },
            ],
        },
        ldo1: ldoDoc(1),
        ldo2: ldoDoc(2),
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
                            Configure the die temperature monitoring, which is
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
                            Temperature threshold for the charging to resume.
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
                        <p key="p1">
                            Temperature threshold for the charging to stop.
                        </p>,
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
                            Configure the different battery temperature
                            thresholds according to JEITA.
                        </p>,
                        <p key="p2">
                            The default values match the JEITA guidelines.
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
                            Set the termination voltage for the “Warm”
                            temperature region. Can be set equal to V
                            <span className="subscript">TERM</span> if reduced
                            termination voltage in “Warm” temperature region is
                            not wanted.
                        </p>,
                    ],
                },
            ],
            NTCThermistor: [
                {
                    title: 'NTC thermistor',
                    content: [
                        <p key="p1">
                            Select the NTC thermistor from among the three NTC
                            thermistors for battery temperature monitoring
                            supported by the charger. The available options are
                            10 kΩ, 47 kΩ, 100 kΩ, or no NTC thermistor.
                        </p>,
                        <p key="p2">
                            If no NTC thermistor is chosen, the NTC pin must be
                            connected to GND and the battery pack must have a
                            thermal fuse for safety.
                        </p>,
                    ],
                },
            ],
            DefaultNTCBeta: [
                {
                    title: 'Default NTC Beta',
                    content: [
                        <p key="p1">Use default value for NTC Beta.</p>,
                        <p key="p2">
                            Defaults for the NTC thermistor selected:
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
                        <p key="p1">
                            {deviceType} has three 5-mA LED drivers. When using
                            all three LED pins, the LED drivers are configured
                            as RGB LED.
                        </p>,
                        <p key="p2">
                            These can be configured for one of the following
                            purposes:
                            <ul className="tw-ml-6 tw-list-disc">
                                <li>Charger error indication</li>
                                <li>Charging indication</li>
                                <li>
                                    Host activity indication
                                    <ul className="tw-ml-6 tw-list-disc">
                                        <li>
                                            Output high (open drain, requires
                                            external pull-up resistor)
                                        </li>
                                        <li>
                                            Output low (open drain, requires
                                            external pull-up resistor)
                                        </li>
                                    </ul>
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
                            One of the following:
                            <ul className="tw-ml-6 tw-list-disc">
                                <li>SHIPMODEXIT - Reset by Ship Mode exit.</li>
                                <li>
                                    BOOTMONITORTIMEOUT - Boot monitor timeout.
                                </li>
                                <li>WATCHDOGTIMEOUT - Watchdog timeout.</li>
                                <li>
                                    LONGPRESSTIMEOUT - Long press of the
                                    SHPHLD/RESET button.
                                </li>
                                <li>THERMASHUTDOWN - Thermal shutdown.</li>
                                <li>
                                    VSYSLOW - POF (Power Failure) or V
                                    <span className="subscript">SYS</span> low.
                                </li>
                                <li>SWRESET - Software reset.</li>
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
                            One of the following:
                            <ul className="tw-ml-6 tw-list-disc">
                                <li>N/A - No charger error detected.</li>
                                <li>
                                    NTCSENSORERR - NTC thermistor sensor error.
                                </li>
                                <li>
                                    NTCSENSORERR - NTC thermistor sensor error.
                                </li>
                                <li>
                                    VBATSENSORERR - V
                                    <span className="subscript">BAT</span>{' '}
                                    sensor error.
                                </li>
                                <li>
                                    VBATLOW - V
                                    <span className="subscript">BAT</span> low
                                    error.
                                </li>
                                <li>VTRICKLE - Vtrickle error.</li>
                                <li>
                                    MEASTIMEOUT - Measurement timeout error.
                                </li>
                                <li>CHARGETIMEOUT - Charge timeout error.</li>
                                <li>TRICKLETIMEOUT - Trickle timeout error.</li>
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
                            One of the following:
                            <ul className="tw-ml-6 tw-list-disc">
                                <li>N/A - No sensor error detected.</li>
                                <li>
                                    SENSORNTCCOLD - Error triggered by NTC
                                    thermistor Cold sensor value.
                                </li>
                                <li>
                                    SENSORNTCCOOL - Error triggered by NTC
                                    thermistor Cool sensor value.
                                </li>
                                <li>
                                    SENSORNTCHOT - Error triggered by NTC
                                    thermistor Hot sensor value.
                                </li>
                                <li>
                                    SENSORVTERM - Error triggered by V
                                    <span className="subscript">term</span>{' '}
                                    sensor value.
                                </li>
                                <li>
                                    SENSORRECHARGE - Error triggered by Recharge
                                    sensor value.
                                </li>
                                <li>
                                    SENSORVTRICKLE - Error triggered by V
                                    <span className="subscript">trickle</span>{' '}
                                    sensor value.
                                </li>
                                <li>
                                    SENSORVBATLOW - Error triggered by V
                                    <span className="subscript">batLow</span>{' '}
                                    sensor value.
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
                            Select the battery model you want to use for Fuel
                            Gauge in nPM PowerUP. To add new battery models, use
                            the <b>Add New Active Battery Model</b> drop-down
                            menu below. You can use the default battery model
                            for initial evaluation, but this will not give the
                            best State of Charge accuracy.
                        </p>,
                    ],
                },
            ],
            AddNewActiveBatteryModel: [
                {
                    title: 'Add New Active Battery Model',
                    content: [
                        <p key="p1">
                            Nordic Semiconductor has profiled batteries from
                            selected vendors. Choose a model from the drop-down
                            menus below to add it to the{' '}
                            <b>Active Battery Model</b> selection.
                        </p>,
                        <p key="p2">
                            You can also add your own custom battery model. If
                            your battery is not listed, click{' '}
                            <b>Profile Battery</b> to create a new battery model
                            and then add it using this menu.
                        </p>,
                        <p key="p3">
                            For quick evaluation, you can also use one of the
                            branded battery models matching the capacity of your
                            battery. However, this will not give the best State
                            of Charge accuracy.
                        </p>,
                    ],
                },
            ],
            ProfileBattery: [
                {
                    title: 'Profile Battery',
                    content: [
                        <p key="p1">
                            {`Battery profiling provides accurate State of Charge
                        estimation across voltage, current, and temperature
                        range for the specific battery used. The result of the
                        battery profiling is a battery model. To evaluate the
                        custom battery model in nPM PowerUP, select the battery
                        model in `}
                            <b>Add New Active Battery Model</b>
                            {` and write
                        its JSON file to the selected battery model slot. To
                        continue development and implementation on your own
                        design, use the battery model INC file. See the `}
                            <ExternalLink
                                label={`${deviceType.replace(
                                    'npm',
                                    'nPM',
                                )} fuel gauge sample in the nRF Connect SDK documentation`}
                                href={`https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/pmic/native/${npmDevice.deviceType}_fuel_gauge/README.html`}
                            />
                            {' for more information.'}
                        </p>,
                        <p key="p2">
                            An additional board, nPM Fuel Gauge, is required to
                            perform the battery profiling. This board must be
                            connected to EK before battery profiling is started.
                        </p>,
                    ],
                },
            ],
            ExportConfiguration: [
                {
                    title: <span>Export Configuration</span>,
                    content: [
                        <p key="p1">
                            Exports the {deviceType} configuration based on the
                            nPM PowerUP settings. Choose the overlay format to
                            export to a project in the nRF Connect SDK, or JSON
                            to save the configuration for later use in nPM
                            PowerUP (&quot;Load Configuration&quot; option).
                        </p>,
                        <p key="p2">
                            For more details about importing to the nRF Connect
                            SDK, see{' '}
                            <ExternalLink
                                label="Importing an overlay from nPM PowerUP"
                                href={`https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/device_guides/pmic/${npmDevice.deviceType}.html#importing_an_overlay_from_npm_powerup`}
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
                            Loads a saved nPM PowerUP configuration from a JSON
                            file and updates all device configurations
                            accordingly.
                        </p>,
                    ],
                },
            ],
            ResetDevice: [
                {
                    title: 'Reset Device',
                    content: [
                        <p key="p1">
                            Reset the PMIC and nPM Controller. The PMIC default
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
                            Saves all terminal log events to CSV files,
                            including commands executed, battery voltage,
                            current temperature, voltage, State of Charge, time
                            to empty, and time to full.
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
                            The battery discharge cut-off voltage. Set this
                            according to the battery datasheet or based on the
                            application&apos;s minimum operating voltage
                            requirements.
                        </p>,
                    ],
                },
            ],
            Capacity: [
                {
                    title: 'Capacity',
                    content: [
                        <p key="p1">
                            The battery capacity in mAh. Set this according to
                            the rated capacity of the battery used.
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
                            temperatures range from 0°C to 60°C, in steps of
                            1°C.
                        </p>,
                        <p key="p2">
                            Profile at three different temperatures for best
                            State of Charge accuracy. For example, if your
                            application temperature range is 5°C to 45°C, set
                            profiling at 5°C, 25°C, and 45°C.
                        </p>,
                    ],
                },
            ],
        },
    };
};
