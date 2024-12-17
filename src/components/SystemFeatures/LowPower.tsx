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
    LowPowerConfig,
    LowPowerModule,
} from '../../features/pmicControl/npm/types';

const card = 'lowPowerControl';

export default ({
    lowPowerModule,
    lowPower,
    disabled,
}: {
    lowPowerModule: LowPowerModule;
    lowPower: LowPowerConfig;
    disabled: boolean;
}) => (
    <Card
        title={
            <div className="tw-flex tw-justify-between tw-gap-1">
                Low Power control
            </div>
        }
    >
        {'powerButtonEnable' in lowPower &&
            lowPowerModule.set.powerButtonEnable && (
                <Toggle
                    label={
                        <DocumentationTooltip
                            card={card}
                            item="LongPressResetEnable"
                        >
                            Enable
                        </DocumentationTooltip>
                    }
                    isToggled={lowPower.powerButtonEnable === true}
                    onToggle={value =>
                        lowPowerModule.set.powerButtonEnable?.(value)
                    }
                    disabled={disabled}
                />
            )}
        <Dropdown
            label={
                <>
                    T<span className="subscript">ShipToActive</span>
                </>
            }
            items={lowPowerModule.values.timeToActive}
            onSelect={item => lowPowerModule.set.timeToActive(item.value)}
            selectedItem={
                lowPowerModule.values.timeToActive[
                    Math.max(
                        0,
                        lowPowerModule.values.timeToActive.findIndex(
                            item => item.value === lowPower.timeToActive
                        )
                    ) ?? 0
                ]
            }
            disabled={disabled}
        />
        <div className="tw-flex tw-flex-col tw-gap-1">
            {lowPowerModule.actions.enterShipMode && (
                <DocumentationTooltip card={card} item="EnterShipMode">
                    <Button
                        variant="secondary"
                        className="tw-w-full"
                        onClick={() => {
                            lowPowerModule.actions.enterShipMode?.();
                        }}
                        disabled={disabled}
                    >
                        Enter Ship Mode
                    </Button>
                </DocumentationTooltip>
            )}
            {lowPowerModule.actions.enterShipHibernateMode && (
                <DocumentationTooltip card={card} item="EnterHibernateMode">
                    <Button
                        variant="secondary"
                        className="tw-w-full"
                        onClick={() => {
                            lowPowerModule.actions.enterShipHibernateMode?.();
                        }}
                        disabled={disabled}
                    >
                        Enter Hibernate Mode
                    </Button>
                </DocumentationTooltip>
            )}
            {lowPowerModule.actions.enterHibernatePtMode && (
                <DocumentationTooltip card={card} item="EnterHibernateMode">
                    <Button
                        variant="secondary"
                        className="tw-w-full"
                        onClick={() => {
                            lowPowerModule.actions.enterHibernatePtMode?.();
                        }}
                        disabled={disabled}
                    >
                        Enter Hibernate PT Mode
                    </Button>
                </DocumentationTooltip>
            )}
        </div>
    </Card>
);
