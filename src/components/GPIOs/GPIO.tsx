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

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    GPIO,
    GPIODrive,
    GPIODriveValues,
    GPIOMode,
    GPIOModeValues,
    GpioModule,
    GPIOPullMode,
    GPIOPullValues,
} from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    gpioModule: GpioModule;
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

const card = 'gpio';

export default ({
    gpioModule,
    gpio,
    cardLabel = `GPIO${gpioModule.index}`,
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
            label={
                <DocumentationTooltip
                    card={`${card}${gpioModule.index}`}
                    item="Mode"
                >
                    <span>Mode</span>
                </DocumentationTooltip>
            }
            items={gpioModeValuesItems}
            onSelect={item => gpioModule.set.mode(item.value as GPIOMode)}
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
            label={
                <DocumentationTooltip
                    card={`${card}${gpioModule.index}`}
                    item="Pull"
                >
                    <span>Pull</span>
                </DocumentationTooltip>
            }
            items={gpioPullValues}
            onSelect={item => gpioModule.set.pull(item.value as GPIOPullMode)}
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
            disabled={disabled || gpio.mode.startsWith('Output')}
        />
        <Dropdown
            label={
                <DocumentationTooltip
                    card={`${card}${gpioModule.index}`}
                    item="Drive"
                >
                    <span>Drive</span>
                </DocumentationTooltip>
            }
            items={gpioDriveValuesItems}
            onSelect={item =>
                gpioModule.set.drive(
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
            disabled={disabled || gpio.mode.startsWith('Input')}
        />
        <Toggle
            label={
                <DocumentationTooltip
                    card={`${card}${gpioModule.index}`}
                    item="OpenDrain"
                >
                    <span>Open Drain</span>
                </DocumentationTooltip>
            }
            isToggled={gpio.openDrain}
            onToggle={value => gpioModule.set.openDrain(value)}
            disabled={disabled}
        />
        <Toggle
            label={
                <DocumentationTooltip
                    card={`${card}${gpioModule.index}`}
                    item="Debounce"
                >
                    <span>Debounce</span>
                </DocumentationTooltip>
            }
            isToggled={gpio.debounce}
            onToggle={value => gpioModule.set.debounce(value)}
            disabled={disabled || gpio.mode.startsWith('Output')}
        />
    </Card>
);
