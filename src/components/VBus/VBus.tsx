/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import {
    Card,
    NumberInputSliderWithUnit,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmDevice, USBPower } from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    npmDevice: NpmDevice;
    usbPower: USBPower;
    disabled: boolean;
}

export default ({ npmDevice, usbPower, disabled }: GPIOProperties) => {
    const [internalCurrentLimiter, setInternalCurrentLimiter] = useState(
        usbPower.currentLimiter
    );

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <span>
                        V<span className="subscript">BUS</span> input current
                        limiter
                    </span>

                    <div className="d-flex">{`${usbPower.detectStatus}`}</div>
                </div>
            }
        >
            <NumberInputSliderWithUnit
                label="Current Limiter"
                disabled={disabled}
                range={npmDevice.getUSBCurrentLimiterRange()}
                value={internalCurrentLimiter}
                onChange={setInternalCurrentLimiter}
                onChangeComplete={() => {}}
                unit="A"
            />
        </Card>
    );
};
