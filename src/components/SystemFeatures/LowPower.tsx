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
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    LowPowerConfig,
    LowPowerModule,
    TimeToActive,
    TimeToActiveValues,
} from '../../features/pmicControl/npm/types';

const timerShipToActiveItems = TimeToActiveValues.map(item => ({
    label: `${item} ms`,
    value: `${item}`,
}));

const card = 'lowPowerControl';

export default ({
    lowPowerModule,
    ship,
    disabled,
}: {
    lowPowerModule: LowPowerModule;
    ship: LowPowerConfig;
    disabled: boolean;
}) => (
    <Card
        title={
            <div className="tw-flex tw-justify-between">Low Power control</div>
        }
    >
        <Dropdown
            label={
                <>
                    T<span className="subscript">ShipToActive</span>
                </>
            }
            items={timerShipToActiveItems}
            onSelect={item =>
                lowPowerModule.set.timeToActive(
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
                    lowPowerModule.set.enterShipMode();
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
                    lowPowerModule.set.enterShipHibernateMode();
                }}
                disabled={disabled}
            >
                Enter Hibernate Mode
            </Button>
        </DocumentationTooltip>
    </Card>
);
