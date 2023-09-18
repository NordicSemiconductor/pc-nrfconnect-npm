/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    Card,
    Dropdown,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    GPIO,
    GPIODrive,
    GPIODriveValues,
    GPIOMode,
    GPIOModeValues,
    GPIOPullMode,
    GPIOPullValues,
    NpmDevice,
} from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    npmDevice: NpmDevice;
    index: number;
    gpio: GPIO;
    cardLabel?: string;
    disabled: boolean;
}

const gpioModeValuesItems = [...GPIOModeValues].map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

const gpioDriveValuesItems = [...GPIODriveValues].map(item => ({
    label: `${item} mA`,
    value: `${item}`,
}));

const gpioPullValues = [...GPIOPullValues].map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

export default ({
    npmDevice,
    index,
    gpio,
    cardLabel = `GPIO${index}`,
    disabled,
}: GPIOProperties) => (
    <Card
        title={
            <div className="tw-flex tw-justify-between">
                <span>{cardLabel}</span>

                <div className="d-flex">
                    {`${gpio.mode.startsWith('Input') ? 'Input' : 'Output'}`}
                </div>
            </div>
        }
    >
        <Dropdown
            label="Mode"
            items={gpioModeValuesItems}
            onSelect={item =>
                npmDevice.setGpioMode(index, item.value as GPIOMode)
            }
            selectedItem={
                gpioModeValuesItems[
                    Math.max(
                        0,
                        gpioModeValuesItems.findIndex(
                            item => item.value === gpio.mode
                        )
                    ) ?? 0
                ]
            }
            disabled={disabled}
        />
        <Dropdown
            label="Pull"
            items={gpioPullValues}
            onSelect={item =>
                npmDevice.setGpioPull(index, item.value as GPIOPullMode)
            }
            selectedItem={
                gpioPullValues[
                    Math.max(
                        0,
                        gpioPullValues.findIndex(
                            item => item.value === gpio.pull
                        )
                    ) ?? 0
                ]
            }
            disabled={disabled}
        />
        <Dropdown
            label="Drive"
            items={gpioDriveValuesItems}
            onSelect={item =>
                npmDevice.setGpioDrive(
                    index,
                    Number.parseInt(item.value, 10) as GPIODrive
                )
            }
            selectedItem={
                gpioDriveValuesItems[
                    Math.max(
                        0,
                        gpioDriveValuesItems.findIndex(
                            item =>
                                Number.parseInt(item.value, 10) === gpio.drive
                        )
                    ) ?? 0
                ]
            }
            disabled={disabled}
        />
        <Toggle
            label="Open Drain"
            isToggled={gpio.openDrain}
            onToggle={value => npmDevice.setGpioOpenDrain(index, value)}
            disabled={disabled}
        />
        <Toggle
            label="Debounce"
            isToggled={gpio.debounce}
            onToggle={value => npmDevice.setGpioDebounce(index, value)}
            disabled={disabled}
        />
    </Card>
);
