/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { documentation as nPM1300Documentation } from '../npm1300/documentationPmic1300';
import { Documentation } from '../types';

export const documentation: Documentation = {
    ...nPM1300Documentation,
    charger: {
        ...nPM1300Documentation.charger,
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
                        Set the charging current limit. This should be
                        configured according to your battery specification.
                    </p>,
                ],
            },
            {
                title: 'Range',
                content: [<p key="p1">4 mA to 100 mA, in 0.5 mA steps.</p>],
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
                        Set the charger termination voltage. This is the maximum
                        battery voltage allowed. When V
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
                        3.6 V to 3.65 V, and 4.00 V to 4.65 V, in 50-mV steps.
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
                        Set the charging termination current level as a percent
                        of I<span className="subscript">CHG</span>, either 5%
                        (default) or 10%.
                    </p>,
                    <p key="p2">
                        When the charging mode is “Constant Voltage”, the
                        current flow into the battery is monitored.
                    </p>,
                    <p key="p3">
                        When the current drops below I
                        <span className="subscript">TERM</span>, the charging is
                        complete.
                    </p>,
                ],
            },
        ],
    },
};
