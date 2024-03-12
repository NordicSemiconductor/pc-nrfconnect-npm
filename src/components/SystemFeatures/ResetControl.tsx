/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    Button,
    Card,
    Dropdown,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    NpmDevice,
    ShipModeConfig,
    TimeToActive,
    TimeToActiveValues,
} from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    npmDevice: NpmDevice;
    ship: ShipModeConfig;
    disabled: boolean;
}

const timerShipToActiveItems = TimeToActiveValues.map(item => ({
    label: `${item} ms`,
    value: `${item}`,
}));

const card = 'resetControl';

export default ({ npmDevice, ship, disabled }: GPIOProperties) => (
    <Card
        title={
            <div className="tw-flex tw-justify-between">
                Reset and Low Power control
            </div>
        }
    >
        <Toggle
            label={
                <DocumentationTooltip card={card} item="LongPressReset">
                    Long Press Reset
                </DocumentationTooltip>
            }
            onToggle={npmDevice.setShipLongPressReset}
            disabled={disabled}
            isToggled={ship.longPressReset}
        />
        <Dropdown
            label={
                <>
                    T<span className="subscript">ShipToActive</span>
                </>
            }
            items={timerShipToActiveItems}
            onSelect={item =>
                npmDevice.setShipModeTimeToActive(
                    Number.parseInt(item.value, 10) as TimeToActive
                )
            }
            selectedItem={
                timerShipToActiveItems[
                    Math.max(
                        0,
                        timerShipToActiveItems.findIndex(
                            item =>
                                Number.parseInt(item.value, 10) ===
                                ship.timeToActive
                        )
                    ) ?? 0
                ]
            }
            disabled={disabled}
        />

        <DocumentationTooltip card={card} item="EnterShipMode">
            <Button
                variant="secondary"
                className="tw-w-full"
                onClick={() => {
                    npmDevice.enterShipMode();
                }}
                disabled={disabled}
            >
                Enter Ship Mode
            </Button>
        </DocumentationTooltip>
        <DocumentationTooltip card={card} item="EnterHibernateMode">
            <Button
                variant="secondary"
                className="tw-w-full"
                onClick={() => {
                    npmDevice.enterShipHibernateMode();
                }}
                disabled={disabled}
            >
                Enter Hibernate Mode
            </Button>
        </DocumentationTooltip>
    </Card>
);
