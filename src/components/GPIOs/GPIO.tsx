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
    GPIOMode,
    GpioModule,
    GPIOPull,
} from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    gpioModule: GpioModule;
    gpio: GPIO;
    cardLabel?: string;
    disabled: boolean;
}

const card = 'gpio';

export default ({
    gpioModule,
    gpio,
    cardLabel = `GPIO${gpioModule.index}`,
    disabled,
}: GPIOProperties) => {
    const toStringMode = (mode: GPIOMode) =>
        gpioModule.values.mode.find(m => m.value === mode)?.label;

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <span>{cardLabel}</span>

                    <div className="d-flex">
                        {`${
                            toStringMode(gpio.mode)?.startsWith('Input')
                                ? 'Input'
                                : 'Output'
                        }`}
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
                items={gpioModule.values.mode}
                onSelect={item => gpioModule.set.mode(item.value as GPIOMode)}
                selectedItem={
                    gpioModule.values.mode.find(
                        item => item.value === gpio.mode
                    ) ?? gpioModule.values.mode[0]
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
                items={gpioModule.values.pull}
                onSelect={item => gpioModule.set.pull(item.value as GPIOPull)}
                selectedItem={
                    gpioModule.values.pull.find(
                        item => item.value === gpio.pull
                    ) ?? gpioModule.values.pull[0]
                }
                disabled={disabled || !gpio.pullEnabled}
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
                items={gpioModule.values.drive}
                onSelect={item => gpioModule.set.drive(item.value)}
                selectedItem={
                    gpioModule.values.drive.find(
                        item => item.value === gpio.drive
                    ) ?? gpioModule.values.drive[0]
                }
                disabled={disabled || !gpio.driveEnabled}
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
                disabled={disabled || !gpio.openDrainEnabled}
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
                disabled={disabled || !gpio.pullEnabled}
            />
        </Card>
    );
};
