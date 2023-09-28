/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import {
    MasonryLayout,
    PaneProps,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getGPIOs,
    getLEDs,
    getNpmDevice,
    getPOF,
    getShip,
    getTimerConfig,
    getUsbPower,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import GPIO from '../GPIO/GPIO';
import LEDs from '../LEDs/LEDs';
import SafetyAndLowPower from '../SafetyAndLowPower/SafetyAndLowPower';
import VBus from '../VBus/VBus';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const gpios = useSelector(getGPIOs);
    const leds = useSelector(getLEDs);
    const pof = useSelector(getPOF);
    const ship = useSelector(getShip);
    const usbPower = useSelector(getUsbPower);
    const timerConfig = useSelector(getTimerConfig);

    return active ? (
        <MasonryLayout className="masonry-layout" minWidth={300}>
            {npmDevice && (
                <SafetyAndLowPower
                    npmDevice={npmDevice}
                    pof={pof}
                    ship={ship}
                    timerConfig={timerConfig}
                    disabled={disabled}
                />
            )}
            {npmDevice &&
                gpios.map((gpio, index) => (
                    <GPIO
                        gpio={gpio}
                        npmDevice={npmDevice}
                        key={`GPIO${1 + index}`}
                        index={index}
                        disabled={disabled}
                    />
                ))}
            {npmDevice && (
                <LEDs npmDevice={npmDevice} leds={leds} disabled={disabled} />
            )}
            {npmDevice && (
                <VBus
                    npmDevice={npmDevice}
                    usbPower={usbPower}
                    disabled={disabled}
                />
            )}
        </MasonryLayout>
    ) : null;
};
