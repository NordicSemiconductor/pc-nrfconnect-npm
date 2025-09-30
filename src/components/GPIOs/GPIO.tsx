/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    Card,
    Dropdown,
    StateSelector,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    GPIO,
    GPIOMode,
    GpioModule,
    GPIOPull,
    GPIOState,
} from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    gpioModule: GpioModule;
    gpio: GPIO;
    cardLabel?: string;
    disabled: boolean;
}

export default ({
    gpioModule,
    gpio,
    cardLabel = `GPIO${gpioModule.index}`,
    disabled,
}: GPIOProperties) => {
    const toStringMode = (mode: GPIOMode) =>
        gpioModule.values.mode.find(m => m.value === mode)?.label;

    const card = `gpio${gpioModule.index}`;
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
                    <DocumentationTooltip card={card} item="Mode">
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
            {gpio.stateShown &&
                gpioModule.set.state &&
                gpioModule.values.state && (
                    <div>
                        <p className="tw-mb-1 tw-text-xs">State</p>
                        <StateSelector
                            disabled={disabled}
                            items={gpioModule.values.state.map(
                                item => item.label
                            )}
                            onSelect={i =>
                                gpioModule.set.state?.(
                                    gpioModule.values.state?.[i]
                                        .value as GPIOState
                                )
                            }
                            selectedItem={
                                gpioModule.values.state.find(
                                    item => item.value === gpio.state
                                )?.label ?? gpioModule.values.state[0].label
                            }
                        />
                    </div>
                )}
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="Pull">
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
                    <DocumentationTooltip card={card} item="Drive">
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
                    <DocumentationTooltip card={card} item="OpenDrain">
                        <span>Open Drain</span>
                    </DocumentationTooltip>
                }
                isToggled={gpio.openDrain}
                onToggle={value => gpioModule.set.openDrain(value)}
                disabled={disabled || !gpio.openDrainEnabled}
            />
            <Toggle
                label={
                    <DocumentationTooltip card={card} item="Debounce">
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
