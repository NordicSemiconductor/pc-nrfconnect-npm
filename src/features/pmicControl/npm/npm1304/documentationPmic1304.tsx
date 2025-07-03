/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { documentation as nPM1300Documentation } from '../npm1300/documentationPmic1300';
import { Documentation } from '../types';
import Npm1304 from './pmic1304Device';

export const documentation = (npmDevice: Npm1304): Documentation => {
    const npm1300BaseDoc = nPM1300Documentation(npmDevice);
    return {
        ...npm1300BaseDoc,
        charger: {
            ...npm1300BaseDoc.charger,
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
                        <p key="p1">4 mA to 100 mA, in steps of 0.5 mA.</p>,
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
                            3.6 V to 3.65 V, and 4.00 V to 4.65 V, in steps of
                            50 mV.
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
                            either 5% or 10% (default).
                        </p>,
                        <p key="p2">
                            When the charging mode is set to constant voltage,
                            the app monitors the current flow into the battery.
                        </p>,
                        <p key="p3">
                            When the current drops below I
                            <span className="subscript">TERM</span>, the
                            charging is complete.
                        </p>,
                    ],
                },
            ],
        },
        batteryStatus: {
            ...npm1300BaseDoc.batteryStatus,
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
                    content: [<p key="p1">2.3 V to 4.65 V </p>],
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
                    content: [<p key="p1">0 mA to 125 mA</p>],
                },
                {
                    title: 'Range charging',
                    content: [<p key="p1">-4 mA to -100 mA</p>],
                },
            ],
        },
        OnBoardLoad: {
            iLoad: [
                {
                    title: 'iLoad',
                    content: [
                        <p key="p1">
                            The nPM1304 EK includes a switch <b>SW5</b>, which
                            connects an active load to V
                            <span className="subscript">SYS</span>. The active
                            load is used for battery profiling. You can also use
                            it as a generic load during evaluation and
                            development. For such use, you can keep the active
                            load connected to nPM1304&apos;s V
                            <span className="subscript">SYS</span> rail.
                            Alternatively, connect it to V
                            <span className="subscript">OUT1</span> or V
                            <span className="subscript">OUT2</span> using the
                            load switches (LS) and P15 and P20 jumpers.
                        </p>,
                    ],
                },
                {
                    title: 'Range',
                    content: [<p key="p1">0 - 99 mA</p>],
                },
            ],
        },
        sidePanel: {
            ...npm1300BaseDoc.sidePanel,
            ActiveBatteryModel: [
                {
                    title: 'Active Battery Model',
                    content: [
                        <p key="p1">
                            Select the battery model you want to use for Fuel
                            Gauge in nPM PowerUP. To add new battery models, use
                            the <b>Add New Active Battery Model</b> drop-down
                            menu below.
                        </p>,
                        <p key="p2">
                            The nPM1304 EK is shipped with a 20 mAh LiPo
                            battery. This is also the default battery model when
                            connecting to the kit. Battery electrical
                            specification:
                            <ul className="tw-ml-6 tw-list-disc">
                                <li>Nominal voltage: 3.70 V</li>
                                <li>Max charge voltage (Vterm): 4.20 V</li>
                                <li>Max charge current (Ichg): 10 mA</li>
                                <li>Max continuous discharge current: 60 mA</li>
                                <li>Discharge Cut Off voltage: 2.75 V</li>
                            </ul>
                        </p>,
                    ],
                },
            ],
        },
    };
};
