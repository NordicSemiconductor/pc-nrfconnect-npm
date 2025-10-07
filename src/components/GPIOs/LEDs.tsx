/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Card, Dropdown } from '@nordicsemiconductor/pc-nrfconnect-shared';

import BaseNpmDevice from '../../features/pmicControl/npm/basePmicDevice';
import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    LED,
    LEDMode,
    LEDModeValues,
} from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    npmDevice: BaseNpmDevice;
    leds: LED[];
    disabled: boolean;
}

const ledModeValuesItems = LEDModeValues.map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

export default ({ npmDevice, leds, disabled }: GPIOProperties) => (
    <Card
        title={
            <div className="tw-flex tw-justify-between">
                <DocumentationTooltip card="LED" item="LED">
                    <span>LEDs</span>
                </DocumentationTooltip>
            </div>
        }
    >
        {leds.map((led, index) => (
            <Dropdown
                key={`LED${1 + index}`}
                label={`LED${index}`}
                items={ledModeValuesItems}
                onSelect={item =>
                    npmDevice.setLedMode(index, item.value as LEDMode)
                }
                selectedItem={
                    ledModeValuesItems[
                        Math.max(
                            0,
                            ledModeValuesItems.findIndex(
                                item => item.value === led.mode,
                            ),
                        ) ?? 0
                    ]
                }
                disabled={disabled}
            />
        ))}
    </Card>
);
