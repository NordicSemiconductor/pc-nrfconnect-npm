/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    Button,
    Card,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    NpmDevice,
    ShipModeConfig,
} from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    npmDevice: NpmDevice;
    ship: ShipModeConfig;
    disabled: boolean;
}

export default ({ npmDevice, ship, disabled }: GPIOProperties) => (
    <Card
        title={
            <div className="tw-flex tw-justify-between">
                <span>Reset and Low Power control</span>
            </div>
        }
    >
        <Toggle
            label="Ship invert polarity"
            onToggle={npmDevice.setShipInvertPolarity}
            disabled={disabled}
            isToggled={ship.invPolarity}
        />
        <Toggle
            label="Long Press Reset"
            onToggle={npmDevice.setShipLongPressReset}
            disabled={disabled}
            isToggled={ship.longPressReset}
        />
        <Toggle
            label="Two Button Reset"
            onToggle={npmDevice.setShipTwoButtonReset}
            disabled={disabled}
            isToggled={ship.twoButtonReset}
        />
        <Button
            variant="secondary"
            className="tw-my-2 tw-w-full"
            onClick={() => {
                npmDevice.enterShipMode();
            }}
            disabled={disabled}
        >
            Enter Ship Mode
        </Button>
        <Button
            variant="secondary"
            className="tw-my-1 tw-w-full"
            onClick={() => {
                npmDevice.enterShipHibernateMode();
            }}
            disabled={disabled}
        >
            Enter Hibernate Mode
        </Button>
    </Card>
);
