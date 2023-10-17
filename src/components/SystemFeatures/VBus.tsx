/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    Card,
    classNames,
    NumberInputSliderWithUnit,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmDevice, USBPower } from '../../features/pmicControl/npm/types';

interface VBusProperties {
    npmDevice: NpmDevice;
    usbPower: USBPower;
    disabled: boolean;
}

export default ({ npmDevice, usbPower, disabled }: VBusProperties) => {
    const [internalCurrentLimiter, setInternalCurrentLimiter] = useState(
        usbPower.currentLimiter
    );

    useEffect(() => {
        setInternalCurrentLimiter(usbPower.currentLimiter);
    }, [usbPower]);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <span>
                        V<span className="subscript">BUS</span> input current
                        limiter
                    </span>
                </div>
            }
        >
            <div
                className={`tw-preflight tw-flex tw-flex-col tw-gap-0.5 ${classNames(
                    disabled && 'tw-text-gray-300'
                )}`}
            >
                <div className="tw-flex tw-justify-between tw-pb-0.5 tw-text-xs">
                    <span className="tw-font-medium">USB Detect Status</span>
                    <span className="tw-text-right">
                        {usbPower.detectStatus}
                    </span>
                </div>
            </div>
            <NumberInputSliderWithUnit
                label="Current Limiter"
                disabled={disabled}
                range={npmDevice.getUSBCurrentLimiterRange()}
                value={internalCurrentLimiter}
                onChange={setInternalCurrentLimiter}
                onChangeComplete={npmDevice.setVBusinCurrentLimiter}
                unit="A"
            />
        </Card>
    );
};
